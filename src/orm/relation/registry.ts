import type {
  RelationColumnKeys,
  RelationMap,
  TableDef,
  TableHandle,
} from "@/orm/schema/types";

type RelationConfig = {
  columnKey: string;
  target: TableHandle<TableDef>;
};

const registry = new WeakMap<TableHandle<TableDef>, Map<string, RelationConfig>>();

function getOrCreateMap(table: TableHandle<TableDef>): Map<string, RelationConfig> {
  let map = registry.get(table);
  if (!map) {
    map = new Map();
    registry.set(table, map);
  }
  return map;
}

export function defineRelations<TDef extends TableDef>(
  table: TableHandle<TDef>,
  relations: RelationMap<TDef>
): TableHandle<TDef> {
  const map = getOrCreateMap(table as TableHandle<TableDef>);

  for (const [columnKey, target] of Object.entries(relations)) {
    if (!target) {
      continue;
    }
    map.set(columnKey, {
      columnKey,
      target: target as TableHandle<TableDef>,
    });
  }

  return table;
}

export function getRelationTarget<
  TDef extends TableDef,
  TKey extends RelationColumnKeys<TDef> & string
>(table: TableHandle<TDef>, columnKey: TKey): TableHandle<TableDef> | undefined {
  const map = registry.get(table as TableHandle<TableDef>);
  return map?.get(columnKey)?.target;
}

export function getRelationConfigs(table: TableHandle<TableDef>): Map<string, RelationConfig> | undefined {
  return registry.get(table);
}
