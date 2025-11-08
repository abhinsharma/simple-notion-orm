import { getDatabasePage } from "@/api/database-page";
import { buildRowEnvelope } from "@/orm/operations/helpers";
import type { PopulateInstruction, RelationPopulateMap, TableDef, TableHandle, RowEnvelope } from "@/orm/schema/types";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { getRelationTarget } from "./registry";

type NormalizedPopulateEntry = {
  columnKey: string;
  instruction: PopulateInstruction;
  targetTable: TableHandle<TableDef>;
};

const FETCH_CONCURRENCY = 4;

export async function populateRelations<TDef extends TableDef>(
  table: TableHandle<TDef>,
  rows: Array<RowEnvelope<TDef>>,
  populate?: RelationPopulateMap<TDef>
): Promise<Array<RowEnvelope<TDef>>> {
  if (!populate || !rows.length) {
    return rows;
  }

  const normalized = normalizePopulateEntries(table, populate);
  if (!normalized.length) {
    return rows;
  }

  const cache = await fetchRelatedPages(normalized, rows);

  return rows.map((row) => {
    const nextData: Record<string, unknown> = { ...row.data };

    for (const entry of normalized) {
      const relationValue = (row.data as Record<string, unknown>)[entry.columnKey];
      if (!Array.isArray(relationValue)) {
        continue;
      }

      nextData[entry.columnKey] = relationValue.map((reference) => {
        if (!reference || typeof reference !== "object" || typeof reference.id !== "string") {
          return reference;
        }

        const related = cache.get(reference.id);
        if (!related) {
          return { id: reference.id };
        }

        if (entry.instruction === true || entry.instruction === "*") {
          return related;
        }

        const projection: Record<string, unknown> = { id: related.page.id };
        for (const field of entry.instruction) {
          projection[field] = (related.data as Record<string, unknown>)[field];
        }
        return projection;
      });
    }

    return {
      ...row,
      data: nextData as RowEnvelope<TDef>["data"],
    };
  });
}

function normalizePopulateEntries<TDef extends TableDef>(table: TableHandle<TDef>, populate: RelationPopulateMap<TDef>): NormalizedPopulateEntry[] {
  const entries: NormalizedPopulateEntry[] = [];

  for (const [columnKey, instruction] of Object.entries(populate)) {
    if (instruction === undefined) {
      continue;
    }

    const target = getRelationTarget(table, columnKey as never);
    if (!target) {
      throw new Error(`No relation metadata found for column '${columnKey}' on table '${table.title}'.`);
    }

    entries.push({
      columnKey,
      instruction: instruction as PopulateInstruction,
      targetTable: target,
    });
  }

  return entries;
}

async function fetchRelatedPages(entries: NormalizedPopulateEntry[], rows: Array<RowEnvelope<TableDef>>): Promise<Map<string, RowEnvelope<TableDef>>> {
  const plan = new Map<TableHandle<TableDef>, Set<string>>();

  for (const entry of entries) {
    let set = plan.get(entry.targetTable);
    if (!set) {
      set = new Set();
      plan.set(entry.targetTable, set);
    }

    for (const row of rows) {
      const relationValue = (row.data as Record<string, unknown>)[entry.columnKey];
      if (!Array.isArray(relationValue)) {
        continue;
      }
      for (const reference of relationValue) {
        if (reference && typeof reference === "object" && typeof reference.id === "string") {
          set.add(reference.id);
        }
      }
    }
  }

  const cache = new Map<string, RowEnvelope<TableDef>>();

  for (const [targetTable, ids] of plan.entries()) {
    const idList = Array.from(ids);
    if (!idList.length) {
      continue;
    }
    await fetchWithConcurrency(idList, async (pageId) => {
      const page = (await getDatabasePage(pageId)) as PageObjectResponse;
      cache.set(pageId, buildRowEnvelope(targetTable, page));
    });
  }

  return cache;
}

async function fetchWithConcurrency<T>(items: string[], worker: (id: string) => Promise<T>): Promise<void> {
  const queue = [...items];

  const executors = Array.from({ length: Math.min(FETCH_CONCURRENCY, queue.length || 1) }, async () => {
    while (queue.length) {
      const id = queue.shift();
      if (!id) {
        break;
      }
      await worker(id);
    }
  });

  await Promise.all(executors);
}
