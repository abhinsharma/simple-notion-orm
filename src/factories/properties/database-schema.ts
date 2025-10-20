/**
 * Database property configuration factories for Notion API
 * These functions build property schema configurations for creating/updating databases
 */

import type {
  NumberFormat,
  SelectOptionConfig,
  RelationConfigInput,
  RollupConfigInput,
  RollupFunction,
} from "@/types/properties";

/**
 * Builds a title property configuration for database schema
 * Every database must have exactly one title property
 *
 * @/returns Title property configuration
 *
 * @example
 * buildTitleColumn()
 */
export function buildTitleColumn() {
  return {
    type: "title" as const,
    title: {},
  };
}

/**
 * Builds a rich text property configuration
 *
 * @/returns Rich text property configuration
 *
 * @example
 * buildRichTextColumn()
 */
export function buildRichTextColumn() {
  return {
    type: "rich_text" as const,
    rich_text: {},
  };
}

/**
 * Builds a number property configuration
 *
 * @param format - Optional number format (e.g., "percent", "dollar")
 * @returns Number property configuration
 *
 * @example
 * buildNumberColumn()
 * buildNumberColumn("percent")
 * buildNumberColumn("dollar")
 */
export function buildNumberColumn(format?: NumberFormat) {
  return {
    type: "number" as const,
    number: format ? { format } : {},
  };
}

/**
 * Builds a date property configuration
 *
 * @/returns Date property configuration
 *
 * @example
 * buildDateColumn()
 */
export function buildDateColumn() {
  return {
    type: "date" as const,
    date: {},
  };
}

/**
 * Builds a checkbox property configuration
 *
 * @/returns Checkbox property configuration
 *
 * @example
 * buildCheckboxColumn()
 */
export function buildCheckboxColumn() {
  return {
    type: "checkbox" as const,
    checkbox: {},
  };
}

/**
 * Builds a URL property configuration
 *
 * @/returns URL property configuration
 *
 * @example
 * buildUrlColumn()
 */
export function buildUrlColumn() {
  return {
    type: "url" as const,
    url: {},
  };
}

/**
 * Builds an email property configuration
 *
 * @/returns Email property configuration
 *
 * @example
 * buildEmailColumn()
 */
export function buildEmailColumn() {
  return {
    type: "email" as const,
    email: {},
  };
}

/**
 * Builds a phone number property configuration
 *
 * @/returns Phone number property configuration
 *
 * @example
 * buildPhoneNumberColumn()
 */
export function buildPhoneNumberColumn() {
  return {
    type: "phone_number" as const,
    phone_number: {},
  };
}

/**
 * Builds a people property configuration
 *
 * @/returns People property configuration
 *
 * @example
 * buildPeopleColumn()
 */
export function buildPeopleColumn() {
  return {
    type: "people" as const,
    people: {},
  };
}

/**
 * Builds a files property configuration
 *
 * @/returns Files property configuration
 *
 * @example
 * buildFilesColumn()
 */
export function buildFilesColumn() {
  return {
    type: "files" as const,
    files: {},
  };
}

/**
 * Builds a select property configuration
 *
 * @param options - Array of select options (optional, can be added later)
 * @returns Select property configuration
 *
 * @example
 * buildSelectColumn([
 *   { name: "To Do", color: "red" },
 *   { name: "In Progress", color: "yellow" },
 *   { name: "Done", color: "green" }
 * ])
 */
export function buildSelectColumn(options?: SelectOptionConfig[]) {
  return {
    type: "select" as const,
    select: options ? { options } : {},
  };
}

/**
 * Builds a multi-select property configuration
 *
 * @param options - Array of multi-select options (optional, can be added later)
 * @returns Multi-select property configuration
 *
 * @example
 * buildMultiSelectColumn([
 *   { name: "Frontend", color: "blue" },
 *   { name: "Backend", color: "green" },
 *   { name: "Design", color: "purple" }
 * ])
 */
export function buildMultiSelectColumn(options?: SelectOptionConfig[]) {
  return {
    type: "multi_select" as const,
    multi_select: options ? { options } : {},
  };
}

/**
 * Builds a status property configuration
 * Status property options are managed separately through the Notion UI
 *
 * @/returns Status property configuration
 *
 * @example
 * buildStatusColumn()
 */
export function buildStatusColumn() {
  return {
    type: "status" as const,
    status: {},
  };
}

/**
 * Builds a relation property configuration
 *
 * @param config - Relation configuration with data source ID and type
 * @returns Relation property configuration
 *
 * @example
 * // Single property relation
 * buildRelationColumn({
 *   data_source_id: "data-source-id-123",
 *   type: "single_property"
 * })
 *
 * // Dual property relation with synced property
 * buildRelationColumn({
 *   data_source_id: "data-source-id-123",
 *   type: "dual_property",
 *   synced_property_name: "Related Items"
 * })
 */
export function buildRelationColumn(config: RelationConfigInput) {
  const relationType = config.type ?? "single_property";

  if (relationType === "single_property") {
    return {
      type: "relation" as const,
      relation: {
        data_source_id: config.data_source_id,
        type: "single_property" as const,
        single_property: {},
      },
    };
  }

  // Dual property relation
  const dualProperty: {
    synced_property_id?: string;
    synced_property_name?: string;
  } = {};

  if (config.synced_property_id) {
    dualProperty.synced_property_id = config.synced_property_id;
  }
  if (config.synced_property_name) {
    dualProperty.synced_property_name = config.synced_property_name;
  }

  return {
    type: "relation" as const,
    relation: {
      data_source_id: config.data_source_id,
      type: "dual_property" as const,
      dual_property: dualProperty,
    },
  };
}

/**
 * Builds a rollup property configuration
 *
 * @param config - Rollup configuration with relation property, rollup property, and function
 * @returns Rollup property configuration
 *
 * @example
 * // Using property names
 * buildRollupColumn({
 *   relation_property_name: "Projects",
 *   rollup_property_name: "Hours",
 *   function: "sum"
 * })
 *
 * // Using property IDs
 * buildRollupColumn({
 *   relation_property_id: "prop-id-123",
 *   rollup_property_id: "prop-id-456",
 *   function: "average"
 * })
 */
export function buildRollupColumn(config: RollupConfigInput) {
  const rollup: {
    function: RollupFunction;
    relation_property_name?: string;
    relation_property_id?: string;
    rollup_property_name?: string;
    rollup_property_id?: string;
  } = {
    function: config.function,
  };

  // Add relation property identifier
  if (config.relation_property_name) {
    rollup.relation_property_name = config.relation_property_name;
  } else if (config.relation_property_id) {
    rollup.relation_property_id = config.relation_property_id;
  }

  // Add rollup property identifier
  if (config.rollup_property_name) {
    rollup.rollup_property_name = config.rollup_property_name;
  } else if (config.rollup_property_id) {
    rollup.rollup_property_id = config.rollup_property_id;
  }

  return {
    type: "rollup" as const,
    rollup,
  };
}

/**
 * Builds a formula property configuration
 *
 * @param expression - Formula expression (required by Notion API)
 * @returns Formula property configuration
 *
 * @example
 * buildFormulaColumn("prop(\"Price\") * prop(\"Quantity\")")
 */
export function buildFormulaColumn(expression: string) {
  if (!expression.trim()) {
    throw new Error("buildFormulaColumn requires a non-empty expression");
  }

  return {
    type: "formula" as const,
    formula: { expression },
  };
}

/**
 * Builds a unique ID property configuration
 *
 * @param prefix - Optional prefix for the unique ID
 * @returns Unique ID property configuration
 *
 * @example
 * buildUniqueIdColumn("TASK")
 * buildUniqueIdColumn() // No prefix
 */
export function buildUniqueIdColumn(prefix?: string | null) {
  return {
    type: "unique_id" as const,
    unique_id: {
      prefix: prefix ?? null,
    },
  };
}

/**
 * Builds a button property configuration
 * Button properties are for interactions and don't store data
 *
 * @/returns Button property configuration
 *
 * @example
 * buildButtonColumn()
 */
export function buildButtonColumn() {
  return {
    type: "button" as const,
    button: {},
  };
}

/**
 * Builds a created by property configuration (read-only system property)
 *
 * @/returns Created by property configuration
 *
 * @example
 * buildCreatedByColumn()
 */
export function buildCreatedByColumn() {
  return {
    type: "created_by" as const,
    created_by: {},
  };
}

/**
 * Builds a created time property configuration (read-only system property)
 *
 * @/returns Created time property configuration
 *
 * @example
 * buildCreatedTimeColumn()
 */
export function buildCreatedTimeColumn() {
  return {
    type: "created_time" as const,
    created_time: {},
  };
}

/**
 * Builds a last edited by property configuration (read-only system property)
 *
 * @/returns Last edited by property configuration
 *
 * @example
 * buildLastEditedByColumn()
 */
export function buildLastEditedByColumn() {
  return {
    type: "last_edited_by" as const,
    last_edited_by: {},
  };
}

/**
 * Builds a last edited time property configuration (read-only system property)
 *
 * @/returns Last edited time property configuration
 *
 * @example
 * buildLastEditedTimeColumn()
 */
export function buildLastEditedTimeColumn() {
  return {
    type: "last_edited_time" as const,
    last_edited_time: {},
  };
}

/**
 * Builds a verification property configuration (read-only system property)
 *
 * @/returns Verification property configuration
 *
 * @example
 * buildVerificationColumn()
 */
export function buildVerificationColumn() {
  return {
    type: "verification" as const,
    verification: {},
  };
}

/**
 * Builds a location property configuration
 *
 * @/returns Location property configuration
 *
 * @example
 * buildLocationColumn()
 */
export function buildLocationColumn() {
  return {
    type: "location" as const,
    location: {},
  };
}

/**
 * Builds a last visited time property configuration (read-only system property)
 *
 * @/returns Last visited time property configuration
 *
 * @example
 * buildLastVisitedTimeColumn()
 */
export function buildLastVisitedTimeColumn() {
  return {
    type: "last_visited_time" as const,
    last_visited_time: {},
  };
}

/**
 * Builds a place property configuration
 *
 * @/returns Place property configuration
 *
 * @example
 * buildPlaceColumn()
 */
export function buildPlaceColumn() {
  return {
    type: "place" as const,
    place: {},
  };
}
