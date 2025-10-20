import { createDatabase, getDatabase, queryDataSource } from "@/api/database";
import { createDatabasePage } from "@/api/database-page";
import type {
  CreateDatabaseParameters,
  CreatePageParameters,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { ColumnDef, RowInput, RowOutput, TableHandle } from "./types";

type InitialDataSource = NonNullable<CreateDatabaseParameters["initial_data_source"]>;
type DatabaseProperties = NonNullable<InitialDataSource["properties"]>;
type TableDefType<TColumns extends Record<string, ColumnDef>> = {
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
  columns: Record<string, ColumnDef>,
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

function getCodecType(columnDef: ColumnDef): string {
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
  providedColumns: Record<string, ColumnDef>
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
  columns: Record<string, ColumnDef>
): Promise<{ databaseId: string; dataSourceId: string }> {
  const resource = await getDatabase(databaseId);

  validateSchema(resource.dataSource.properties, columns);

  return {
    databaseId: resource.database.id,
    dataSourceId: resource.dataSource.id,
  };
}

export async function defineTable<
  const TColumns extends Record<string, ColumnDef>,
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

  return {
    title,
    columns,
    getIds: () => cachedIds,
    cacheIds: () => {},
    insert: async (data: RowInput<TableDefType<TColumns>>) => {
      const properties: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(data)) {
        const columnDef = columns[key];
        if (!columnDef) {
          throw new Error(`Unknown column: ${key}`);
        }

        const encoded = columnDef.codec.parse(value);
        properties[columnDef.name] = encoded;
      }

      await createDatabasePage({
        databaseId: cachedIds.databaseId,
        properties: properties as CreatePageParameters["properties"],
      });

      return data as unknown as RowOutput<TableDefType<TColumns>>;
    },
    select: async () => {
      const response = await queryDataSource(cachedIds.dataSourceId);

      return response.results.map((page) => {
        const row: Record<string, unknown> = {};
        const pageObj = page as PageObjectResponse;

        for (const [key, columnDef] of Object.entries(columns)) {
          const propertyValue = pageObj.properties[columnDef.name];
          if (propertyValue) {
            row[key] = columnDef.codec.encode(propertyValue);
          }
        }

        return row as RowOutput<TableDefType<TColumns>>;
      });
    },
  };
}
