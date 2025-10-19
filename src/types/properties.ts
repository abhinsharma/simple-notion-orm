/**
 * Custom type definitions for property factories
 * Re-exports commonly used types from @notionhq/client for convenience
 */

// Import types that are not exported from @notionhq/client
// These are internal types we need to define manually

/**
 * Date input options for buildDateProperty
 */
export interface DatePropertyInput {
  start: string;
  end?: string | null;
  time_zone?: string | null;
}

/**
 * Select option input (by ID or name)
 */
export type SelectOptionInput =
  | { id: string; name?: string; color?: SelectColor; description?: string | null }
  | { name: string; id?: string; color?: SelectColor; description?: string | null };

/**
 * File input for buildFilesProperty
 */
export type FileInput =
  | { type: 'external'; url: string; name?: string }
  | { type: 'file'; url: string; name?: string };

/**
 * User reference input
 */
export interface UserInput {
  id: string;
}

/**
 * Group reference input
 */
export interface GroupInput {
  id: string;
}

/**
 * Select color options
 */
export type SelectColor =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

/**
 * Number format options for database number properties
 */
export type NumberFormat =
  | "number"
  | "number_with_commas"
  | "percent"
  | "dollar"
  | "canadian_dollar"
  | "singapore_dollar"
  | "euro"
  | "pound"
  | "yen"
  | "ruble"
  | "rupee"
  | "won"
  | "yuan"
  | "real"
  | "lira"
  | "rupiah"
  | "franc"
  | "hong_kong_dollar"
  | "new_zealand_dollar"
  | "krona"
  | "norwegian_krone"
  | "mexican_peso"
  | "rand"
  | "new_taiwan_dollar"
  | "danish_krone"
  | "zloty"
  | "baht"
  | "forint"
  | "koruna"
  | "shekel"
  | "chilean_peso"
  | "philippine_peso"
  | "dirham"
  | "colombian_peso"
  | "riyal"
  | "ringgit"
  | "leu"
  | "argentine_peso"
  | "uruguayan_peso"
  | "peruvian_sol";

/**
 * Rollup function options
 */
export type RollupFunction =
  | "count"
  | "count_values"
  | "empty"
  | "not_empty"
  | "unique"
  | "show_unique"
  | "percent_empty"
  | "percent_not_empty"
  | "sum"
  | "average"
  | "median"
  | "min"
  | "max"
  | "range"
  | "earliest_date"
  | "latest_date"
  | "date_range"
  | "checked"
  | "unchecked"
  | "percent_checked"
  | "percent_unchecked"
  | "count_per_group"
  | "percent_per_group"
  | "show_original";

/**
 * Database select option configuration
 */
export interface SelectOptionConfig {
  name: string;
  color?: SelectColor;
  description?: string | null;
}

/**
 * Relation type for database configuration
 */
export type RelationType = "single_property" | "dual_property";

/**
 * Relation configuration input
 */
export interface RelationConfigInput {
  data_source_id: string;
  type?: RelationType;
  synced_property_id?: string;
  synced_property_name?: string;
}

/**
 * Rollup configuration input
 */
export interface RollupConfigInput {
  relation_property_name?: string;
  relation_property_id?: string;
  rollup_property_name?: string;
  rollup_property_id?: string;
  function: RollupFunction;
}
