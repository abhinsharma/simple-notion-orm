import { updateDatabase } from "@/api/database";
import { buildRelationColumn } from "@/factories/properties/database-schema";
import { ensureTableIds } from "@/orm/operations/helpers";
import type { AnyColumnDef, RelationColumnKeys, TableDef, TableHandle } from "@/orm/schema/types";
import type { RelationConfigInput } from "@/types/properties";
import type { Client } from "@notionhq/client";

type RelationLinkMode = "single" | "dual";

type RelationLinkOptions = {
  syncedPropertyName?: string;
  syncedPropertyId?: string;
};

export type RelationLinkInstruction = {
  source: TableHandle<TableDef>;
  columnKey: string;
  target: TableHandle<TableDef>;
  mode: RelationLinkMode;
  options?: RelationLinkOptions;
};

type RelationPropertyConfig = ReturnType<typeof buildRelationColumn>;

export async function linkRelations(instructions: RelationLinkInstruction[]): Promise<void> {
  if (!instructions.length) {
    return;
  }

  const grouped = new Map<
    TableHandle<TableDef>,
    { properties: Record<string, RelationPropertyConfig>; ids: { databaseId: string; dataSourceId: string }; client?: Client }
  >();

  for (const instruction of instructions) {
    const { source, columnKey, target, mode, options } = instruction;

    // Cross-workspace validation
    const sourceClient = source.getClient();
    const targetClient = target.getClient();
    if (sourceClient !== targetClient) {
      throw new Error(`Cannot link tables from different workspaces: '${source.title}' and '${target.title}' have different clients.`);
    }

    const sourceColumns = source.columns as Record<string, AnyColumnDef>;
    const columnDef = sourceColumns[columnKey];
    if (!columnDef) {
      throw new Error(`Column '${columnKey}' not found on table '${source.title}'.`);
    }
    if (columnDef.propertyType !== "relation") {
      throw new Error(`Column '${columnKey}' on table '${source.title}' is not a relation column.`);
    }

    const sourceIds = ensureTableIds(source);
    const targetIds = ensureTableIds(target);

    let config: RelationConfigInput = {
      data_source_id: targetIds.dataSourceId,
      type: mode === "dual" ? "dual_property" : "single_property",
    };

    if (mode === "dual" && options) {
      config = {
        ...config,
        ...(options.syncedPropertyName ? { synced_property_name: options.syncedPropertyName } : {}),
        ...(options.syncedPropertyId ? { synced_property_id: options.syncedPropertyId } : {}),
      };
    }

    const propertyConfig = buildRelationColumn(config);
    const bucket = grouped.get(source as TableHandle<TableDef>) ?? {
      ids: sourceIds,
      properties: {},
      client: sourceClient,
    };
    bucket.properties[columnDef.name] = propertyConfig;
    grouped.set(source as TableHandle<TableDef>, bucket);
  }

  await Promise.all(
    Array.from(grouped.values()).map(async ({ ids, properties, client }) => {
      await updateDatabase({ databaseId: ids.databaseId, properties }, client);
    })
  );
}

type RelationLinkModeBuilder = {
  single: () => RelationLinkInstruction;
  dual: (options?: RelationLinkOptions) => RelationLinkInstruction;
};

type RelationLinkTargetBuilder = {
  to: <TTarget extends TableDef>(target: TableHandle<TTarget>) => RelationLinkModeBuilder;
};

export function rel<TSource extends TableDef, TKey extends RelationColumnKeys<TSource> & string>(
  table: TableHandle<TSource>,
  columnKey: TKey
): RelationLinkTargetBuilder {
  return {
    to: (target) => ({
      single: () => ({ source: table as TableHandle<TableDef>, columnKey, target: target as TableHandle<TableDef>, mode: "single" as const }),
      dual: (options) => ({
        source: table as TableHandle<TableDef>,
        columnKey,
        target: target as TableHandle<TableDef>,
        mode: "dual" as const,
        options,
      }),
    }),
  };
}
