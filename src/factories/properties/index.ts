/**
 * Property factory barrel export
 * Organized by use case: common page properties, database page properties, and database schema configurations
 */

// Common properties for all pages (database and standalone)
export * from "./page";

// Properties specific to database pages
export * from "./database-page";

// Database schema configuration builders
export * from "./database-schema";
