import { createDatabase, getDatabase } from "@/api/database";
import type {
  CreateDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";
import type { AnyColumnDef, RowInput, TableHandle, TableDef } from "./types";
import { insertRows } from "@/orm/operations/insert";
import { selectRows } from "@/orm/operations/select";
import { updateRows } from "@/orm/operations/update";
import { archiveRows, restoreRows } from "@/orm/operations/archive";

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
    const config = columnDef.codec.config(columnDef.name);
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

function getCodecType(columnDef: AnyColumnDef): string {
  const config = columnDef.codec.config(columnDef.name);
  const propertyConfig = config[columnDef.name];

  if (propertyConfig && typeof propertyConfig === "object") {
    const keys = Object.keys(propertyConfig);
    if (keys.length > 0) {
      return keys[0];
    }
  }

  return "unknown";
}

function validateSchema(
  existingSchema: Record<string, { type: string }>,
  providedColumns: Record<string, AnyColumnDef>
): void {
  for (const [key, columnDef] of Object.entries(providedColumns)) {
    const existingProperty = existingSchema[columnDef.name];

    if (!existingProperty) {
      throw new Error(
        `Column '${key}' (property name: '${columnDef.name}') not found in database schema`
      );
    }

    const expectedType = existingProperty.type;
    const actualType = getCodecType(columnDef);

    if (expectedType !== actualType) {
      throw new Error(
        `Column '${key}' type mismatch: expected '${expectedType}', got '${actualType}'`
      );
    }
  }
}

async function connectToExistingDatabase(
  databaseId: string,
  columns: Record<string, AnyColumnDef>
): Promise<{ databaseId: string; dataSourceId: string }> {
  const resource = await getDatabase(databaseId);

  validateSchema(resource.dataSource.properties, columns);

  return {
    databaseId: resource.database.id,
    dataSourceId: resource.dataSource.id,
  };
}

export async function defineTable<
  const TColumns extends Record<string, AnyColumnDef>,
>(
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
    select: (options) => selectRows(handle, options),
    update: ((patch, options) => updateRows(handle, patch, options)) as TableHandle<TableDefType<TColumns>>["update"],
    archive: (options) => archiveRows(handle, options),
    restore: (options) => restoreRows(handle, options),
  };

  return handle;
}
