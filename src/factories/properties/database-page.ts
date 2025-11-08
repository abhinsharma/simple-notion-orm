/**
 * Database page property value factories for Notion API
 * These functions build property payloads for creating/updating pages IN A DATABASE
 *
 * Note: These properties are ONLY applicable to pages that exist within a database,
 * as they require the database schema to define these property types.
 */

import { textToRichText } from "@/utils/richtext";
import type { DatePropertyInput, SelectOptionInput, FileInput, UserInput, GroupInput } from "@/types/properties";

/**
 * Builds a rich text property value
 *
 * @param text - The rich text content
 * @returns Rich text property payload
 *
 * @example
 * buildRichTextProperty("Some description text")
 */
export function buildRichTextProperty(text: string) {
  return {
    type: "rich_text" as const,
    rich_text: textToRichText(text),
  };
}

/**
 * Builds a number property value
 *
 * @param value - The number value, or null to clear
 * @returns Number property payload
 *
 * @example
 * buildNumberProperty(42)
 * buildNumberProperty(null) // Clear the value
 */
export function buildNumberProperty(value: number | null) {
  return {
    type: "number" as const,
    number: value,
  };
}

/**
 * Builds a date property value
 *
 * @param date - Date configuration with start, optional end, and timezone
 * @returns Date property payload
 *
 * @example
 * buildDateProperty({ start: "2024-01-01" })
 * buildDateProperty({ start: "2024-01-01", end: "2024-01-31" })
 * buildDateProperty({ start: "2024-01-01T10:00:00", time_zone: "America/New_York" })
 * buildDateProperty(null) // Clear the value
 */
export function buildDateProperty(date: DatePropertyInput | null) {
  return {
    type: "date" as const,
    date: date
      ? {
          start: date.start,
          end: date.end ?? null,
          time_zone: date.time_zone ?? null,
        }
      : null,
  };
}

/**
 * Builds a checkbox property value
 *
 * @param checked - Whether the checkbox is checked
 * @returns Checkbox property payload
 *
 * @example
 * buildCheckboxProperty(true)
 * buildCheckboxProperty(false)
 */
export function buildCheckboxProperty(checked: boolean) {
  return {
    type: "checkbox" as const,
    checkbox: checked,
  };
}

/**
 * Builds a URL property value
 *
 * @param url - The URL string, or null to clear
 * @returns URL property payload
 *
 * @example
 * buildUrlProperty("https://example.com")
 * buildUrlProperty(null) // Clear the value
 */
export function buildUrlProperty(url: string | null) {
  return {
    type: "url" as const,
    url: url ? url.trim() : null,
  };
}

/**
 * Builds an email property value
 *
 * @param email - The email address, or null to clear
 * @returns Email property payload
 *
 * @example
 * buildEmailProperty("user@example.com")
 * buildEmailProperty(null) // Clear the value
 */
export function buildEmailProperty(email: string | null) {
  return {
    type: "email" as const,
    email: email ? email.trim() : null,
  };
}

/**
 * Builds a phone number property value
 *
 * @param phoneNumber - The phone number, or null to clear
 * @returns Phone number property payload
 *
 * @example
 * buildPhoneNumberProperty("+1-234-567-8900")
 * buildPhoneNumberProperty(null) // Clear the value
 */
export function buildPhoneNumberProperty(phoneNumber: string | null) {
  return {
    type: "phone_number" as const,
    phone_number: phoneNumber ? phoneNumber.trim() : null,
  };
}

/**
 * Builds a people property value
 *
 * @param users - Array of user IDs or user/group objects
 * @returns People property payload
 *
 * @example
 * buildPeopleProperty(["user-id-1", "user-id-2"])
 * buildPeopleProperty([{ id: "user-id-1" }, { id: "user-id-2" }])
 */
export function buildPeopleProperty(users: string[] | Array<UserInput | GroupInput>) {
  const people = users.map((user) => {
    if (typeof user === "string") {
      return { id: user };
    }
    return { id: user.id };
  });

  return {
    type: "people" as const,
    people,
  };
}

/**
 * Builds a files property value
 *
 * @param files - Array of file configurations
 * @returns Files property payload
 *
 * @example
 * buildFilesProperty([
 *   { type: "external", url: "https://example.com/file.pdf", name: "Document" }
 * ])
 */
export function buildFilesProperty(files: FileInput[]) {
  const fileObjects = files.map((file) => {
    if (file.type === "external") {
      return {
        type: "external" as const,
        external: { url: file.url },
        name: file.name ?? "",
      };
    }
    return {
      type: "file" as const,
      file: { url: file.url },
      name: file.name ?? "",
    };
  });

  return {
    type: "files" as const,
    files: fileObjects,
  };
}

/**
 * Builds a select property value
 *
 * @param option - Select option by name or ID, or null to clear
 * @returns Select property payload
 *
 * @example
 * buildSelectProperty({ name: "In Progress" })
 * buildSelectProperty({ id: "option-id-123" })
 * buildSelectProperty({ name: "Done", color: "green" })
 * buildSelectProperty(null) // Clear the value
 */
export function buildSelectProperty(option: SelectOptionInput | null) {
  if (!option) {
    return {
      type: "select" as const,
      select: null,
    };
  }

  return {
    type: "select" as const,
    select: option,
  };
}

/**
 * Builds a multi-select property value
 *
 * @param options - Array of select options by name or ID
 * @returns Multi-select property payload
 *
 * @example
 * buildMultiSelectProperty([{ name: "Tag1" }, { name: "Tag2" }])
 * buildMultiSelectProperty([{ id: "option-1" }, { id: "option-2" }])
 * buildMultiSelectProperty([]) // Clear all selections
 */
export function buildMultiSelectProperty(options: SelectOptionInput[]) {
  return {
    type: "multi_select" as const,
    multi_select: options,
  };
}

/**
 * Builds a status property value
 *
 * @param status - Status option by name or ID, or null to clear
 * @returns Status property payload
 *
 * @example
 * buildStatusProperty({ name: "In Progress" })
 * buildStatusProperty({ id: "status-id-123" })
 * buildStatusProperty(null) // Clear the value
 */
export function buildStatusProperty(status: SelectOptionInput | null) {
  if (!status) {
    return {
      type: "status" as const,
      status: null,
    };
  }

  return {
    type: "status" as const,
    status,
  };
}

/**
 * Builds a relation property value
 *
 * @param pageIds - Array of page IDs to relate
 * @returns Relation property payload
 *
 * @example
 * buildRelationProperty(["page-id-1", "page-id-2"])
 * buildRelationProperty([]) // Clear all relations
 */
export function buildRelationProperty(relations: Array<{ id: string } | string>) {
  const items = relations.map((value) => {
    if (typeof value === "string") {
      return { id: value };
    }

    return { id: value.id };
  });

  return {
    type: "relation" as const,
    relation: items,
  };
}
