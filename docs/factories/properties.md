# Property Factories

Property factories map application values to the shapes expected by Notion page and database properties. Import them from `@/factories/properties`.

## Page-level properties

| Factory | Description |
| ------- | ----------- |
| `buildTitleProperty(text)` | Primary title property for pages. |

### Example

```ts
import { createPage } from "@/api/page";
import { buildTitleProperty } from "@/factories/properties";

await createPage({
  parentId: "notion-page-id",
  properties: {
    title: buildTitleProperty("Playground page"),
  },
});
```

## Database page properties

| Factory | Description |
| ------- | ----------- |
| `buildRichTextProperty(text)` | Rich text property payload. |
| `buildNumberProperty(value)` | Number property (supports clearing via `null`). |
| `buildDateProperty(date?)` | Date range with optional time zone. |
| `buildCheckboxProperty(checked)` | Checkbox property. |
| `buildUrlProperty(url?)` | URL property (trimmed, nullable). |
| `buildEmailProperty(email?)` | Email property. |
| `buildPhoneNumberProperty(phone?)` | Phone number property. |
| `buildPeopleProperty(users)` | People property (IDs or user/group objects). |
| `buildFilesProperty(files)` | Files property for external/file uploads. |
| `buildSelectProperty(option)` | Single select option by name or id. |
| `buildMultiSelectProperty(options)` | Multi-select property. |
| `buildStatusProperty(option)` | Status property value by name or id. |
| `buildRelationProperty(pageIds)` | Relation property linking to other pages. |
| `buildRollupProperty(value)` | Rollup placeholder (useful for testing/mocks). |

### Example: create a database row

```ts
import { createDatabasePage } from "@/api/database-page";
import {
  buildTitleProperty,
  buildSelectProperty,
  buildRichTextProperty,
} from "@/factories/properties";

await createDatabasePage({
  databaseId: "notion-database-id",
  properties: {
    Name: buildTitleProperty("Example row"),
    Stage: buildSelectProperty({ name: "In Progress" }),
    Notes: buildRichTextProperty("Generated from factories"),
  },
});
```

## Schema helpers

The database schema factories in `src/factories/properties/database-schema.ts` mirror the value builders, emitting configuration for database properties. Use them when provisioning databases via `createDatabase`.

```ts
import { createDatabase } from "@/api/database";
import { textToRichText } from "@/utils/richtext";
import {
  buildSelectConfig,
  buildTitleConfig,
} from "@/factories/properties/database-schema";

await createDatabase({
  parentId: "notion-page-id",
  title: textToRichText("Tasks"),
  properties: {
    Name: buildTitleConfig(),
    Stage: buildSelectConfig([
      { name: "Todo", color: "default" },
      { name: "Done", color: "green" },
    ]),
  },
});
```

These helpers keep property payloads consistent with Notion’s expected JSON and guard against typos when you need to set, update, or provision database columns.
