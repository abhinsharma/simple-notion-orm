import { createdTime, uniqueId } from "@/orm/schema";
import { buildInsertProperties, buildUpdateProperties } from "@/orm/schema/utils";
import { describe, expect, it } from "vitest";

const columns = {
  createdAt: createdTime("Created time"),
  ticketId: uniqueId("Ticket"),
};

describe("read-only columns", () => {
  it("throws when attempting to insert values", () => {
    expect(() =>
      buildInsertProperties(columns, {
        createdAt: "2025-01-01T00:00:00.000Z",
        ticketId: {
          number: 42,
          prefix: "TKT",
          value: "TKT-42",
        },
      })
    ).toThrow(/read-only/);
  });

  it("throws when attempting to update values", () => {
    expect(() =>
      buildUpdateProperties(columns, {
        createdAt: "2025-01-01T00:00:00.000Z",
      })
    ).toThrow(/read-only/);
  });
});
