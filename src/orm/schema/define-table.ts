import { createDatabase, getDatabase } from "@/api/database";
import { archiveRows, restoreRows } from "@/orm/operations/archive";
import { insertRows } from "@/orm/operations/insert";
import { selectRows } from "@/orm/operations/select";
import { updateRows } from "@/orm/operations/update";
import { linkRelations, rel } from "@/orm/relation/linker";
import type { CreateDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import type { AnyColumnDef, RelationColumnKeys, RelationLinkMap, RowInput, TableHandle, TableDef } from "./types";

type InitialDataSource = NonNullable<CreateDatabaseParameters["initial_data_source"]>;
type DatabaseProperties = NonNullable<InitialDataSource["properties"]>;
type TableDefType<TColumns extends Record<string, AnyColumnDef>> = TableDef<TColumns> & {
  title: string;
  columns: TColumns;
  ids: { databaseId: string; dataSourceId: string };
};

type DefineTableOptions = {
  databaseId?: string;
  parentId?: string;
};

async function createNewDatabase(
  title: string,
  columns: Record<string, AnyColumnDef>,
  parentId: string
): Promise<{ databaseId: string; dataSourceId: string }> {
  const schema: Record<string, unknown> = {};
  for (const columnDef of Object.values(columns)) {
    const config = resolveColumnConfig(columnDef);
    if (!config) {
      continue;
    }
    Object.assign(schema, config);
  }

  const result = await createDatabase({
    parentId,
    title: [{ type: "text", text: { content: title } }],
    properties: schema as unknown as DatabaseProperties,
  });

  return {
    databaseId: result.database.id,
    dataSourceId: result.dataSource.id,
  };
}

function resolveColumnConfig(columnDef: AnyColumnDef): Record<string, unknown> | null {
  if (columnDef.propertyType === "relation" && !columnDef.config) {
    return null;
  }

  const configFn = columnDef.config ?? columnDef.codec.config;
  if (!configFn) {
    return null;
  }
  return configFn(columnDef.name);
}

function getCodecType(columnDef: AnyColumnDef): string {
  const config = resolveColumnConfig(columnDef);
  if (!config) {
    return columnDef.propertyType;
  }
  const propertyConfig = config[columnDef.name];

  if (propertyConfig && typeof propertyConfig === "object") {
    const keys = Object.keys(propertyConfig);
    if (keys.length > 0) {
      return keys[0];
    }
  }

  return "unknown";
}

function validateSchema(existingSchema: Record<string, { type: string }>, providedColumns: Record<string, AnyColumnDef>): void {
  for (const [key, columnDef] of Object.entries(providedColumns)) {
    const existingProperty = existingSchema[columnDef.name];

    if (!existingProperty) {
      throw new Error(`Column '${key}' (property name: '${columnDef.name}') not found in database schema`);
    }

    const expectedType = existingProperty.type;
    const actualType = getCodecType(columnDef);

    if (expectedType !== actualType) {
      throw new Error(`Column '${key}' type mismatch: expected '${expectedType}', got '${actualType}'`);
    }
  }
}

async function connectToExistingDatabase(databaseId: string, columns: Record<string, AnyColumnDef>): Promise<{ databaseId: string; dataSourceId: string }> {
  const resource = await getDatabase(databaseId);

  validateSchema(resource.dataSource.properties, columns);

  return {
    databaseId: resource.database.id,
    dataSourceId: resource.dataSource.id,
  };
}

export async function defineTable<const TColumns extends Record<string, AnyColumnDef>>(
  title: string,
  columns: TColumns,
  options: DefineTableOptions
): Promise<TableHandle<TableDefType<TColumns>>> {
  if (!options.databaseId && !options.parentId) {
    throw new Error("Either databaseId or parentId must be provided");
  }

  let cachedIds: { databaseId: string; dataSourceId: string };

  if (options.databaseId) {
    cachedIds = await connectToExistingDatabase(options.databaseId, columns);
  } else {
    cachedIds = await createNewDatabase(title, columns, options.parentId!);
  }

  const handle: TableHandle<TableDefType<TColumns>> = {
    title,
    columns,
    getIds: () => ({ ...cachedIds }),
    cacheIds: (ids) => {
      cachedIds = {
        databaseId: ids.databaseId ?? cachedIds.databaseId,
        dataSourceId: ids.dataSourceId ?? cachedIds.dataSourceId,
      };
    },
    insert: ((data: RowInput<TableDefType<TColumns>> | Array<RowInput<TableDefType<TColumns>>>) => {
      if (Array.isArray(data)) {
        return insertRows(handle, data);
      }
      return insertRows(handle, data);
    }) as TableHandle<TableDefType<TColumns>>["insert"],
    select: (selectOptions) => selectRows(handle, selectOptions),
    update: ((patch, updateOptions) => updateRows(handle, patch, updateOptions)) as TableHandle<TableDefType<TColumns>>["update"],
    archive: (targetOptions) => archiveRows(handle, targetOptions),
    restore: (targetOptions) => restoreRows(handle, targetOptions),
    addRelation: async (columnKey, targetTable, relationOptions) => {
      const builder = rel(handle, columnKey as RelationColumnKeys<TableDefType<TColumns>> & string).to(targetTable);
      const instruction =
        relationOptions?.type === "dual_property"
          ? builder.dual({ syncedPropertyId: relationOptions.syncedPropertyId, syncedPropertyName: relationOptions.syncedPropertyName })
          : builder.single();
      await linkRelations([instruction]);
    },
    addRelations: async (relations: RelationLinkMap<TableDefType<TColumns>>) => {
      const columnKeys = Object.keys(relations) as Array<RelationColumnKeys<TableDefType<TColumns>> & string>;
      const instructions = columnKeys.flatMap((columnKey) => {
        const config = relations[columnKey];
        if (!config) {
          return [];
        }
        const builder = rel(handle, columnKey).to(config.target);
        if (config.options?.type === "dual_property") {
          return [builder.dual({ syncedPropertyId: config.options.syncedPropertyId, syncedPropertyName: config.options.syncedPropertyName })];
        }
        return [builder.single()];
      });

      if (instructions.length) {
        await linkRelations(instructions);
      }
    },
  };

  return handle;
}
