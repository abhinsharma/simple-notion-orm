/* eslint-disable @typescript-eslint/no-explicit-any -- Test file uses 'as any' for mock Notion API responses and testing invalid inputs */

import { titleCodec, type TitlePropertyPayload, type TitlePropertyResponse } from "@/orm/codecs/text/title";
import { describe, it, expect } from "vitest";

describe("titleCodec", () => {
  describe("schema validation (parse)", () => {
    it("accepts valid non-empty strings and encodes to Notion payload", () => {
      const result1 = titleCodec.parse("Valid Title") as TitlePropertyPayload;
      const result2 = titleCodec.parse("Another Title") as TitlePropertyPayload;

      expect(result1.title).toBeDefined();
      expect(result1.title[0].text.content).toBe("Valid Title");
      expect(result2.title[0].text.content).toBe("Another Title");
    });

    it("trims whitespace from input before encoding", () => {
      const result1 = titleCodec.parse("  Trimmed  ") as TitlePropertyPayload;
      const result2 = titleCodec.parse("\t\nSpaces\t\n") as TitlePropertyPayload;

      expect(result1.title[0].text.content).toBe("Trimmed");
      expect(result2.title[0].text.content).toBe("Spaces");
    });

    it("rejects empty strings", () => {
      expect(() => titleCodec.parse("")).toThrow("Title cannot be empty");
    });

    it("rejects whitespace-only strings", () => {
      expect(() => titleCodec.parse("   ")).toThrow("Title cannot be empty");
    });

    it("rejects non-string values", () => {
      expect(() => titleCodec.parse(123 as any)).toThrow();
      expect(() => titleCodec.parse(null as any)).toThrow();
      expect(() => titleCodec.parse(undefined as any)).toThrow();
    });
  });

  describe("encode (app → Notion)", () => {
    it("encodes a simple string to Notion title property", () => {
      const result = titleCodec.parse("My Page Title") as TitlePropertyPayload;

      expect(result).toEqual({
        title: [
          {
            type: "text",
            text: {
              content: "My Page Title",
            },
          },
        ],
      });
    });

    it("trims whitespace before encoding", () => {
      const result = titleCodec.parse("  Trimmed Title  ") as TitlePropertyPayload;

      expect(result.title[0].text.content).toBe("Trimmed Title");
    });

    it("handles special characters", () => {
      const result = titleCodec.parse("Title with 特殊字符 & symbols!") as TitlePropertyPayload;

      expect(result.title[0].text.content).toBe("Title with 特殊字符 & symbols!");
    });
  });

  describe("decode (Notion → app)", () => {
    it("decodes a simple Notion title property to string", () => {
      const notionProperty: TitlePropertyResponse = {
        id: "title",
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: "Decoded Title",
              link: null,
            },
            plain_text: "Decoded Title",
            href: null,
          },
        ],
      };

      const result = titleCodec.encode(notionProperty as any);

      expect(result).toBe("Decoded Title");
    });

    it("concatenates multiple rich text blocks", () => {
      const notionProperty: TitlePropertyResponse = {
        title: [
          {
            type: "text",
            text: { content: "First " },
            plain_text: "First ",
          },
          {
            type: "text",
            text: { content: "Second " },
            plain_text: "Second ",
          },
          {
            type: "text",
            text: { content: "Third" },
            plain_text: "Third",
          },
        ],
      };

      const result = titleCodec.encode(notionProperty as any);

      expect(result).toBe("First Second Third");
    });

    it("falls back to plain_text when text.content is missing", () => {
      const notionProperty: TitlePropertyResponse = {
        title: [
          {
            plain_text: "Fallback Text",
          },
        ],
      };

      const result = titleCodec.encode(notionProperty as any);

      expect(result).toBe("Fallback Text");
    });

    it("returns empty string for empty title array", () => {
      const notionProperty: TitlePropertyResponse = {
        title: [],
      };

      const result = titleCodec.encode(notionProperty as any);

      expect(result).toBe("");
    });

    it("handles malformed property gracefully", () => {
      const notionProperty = { title: null } as any;

      const result = titleCodec.encode(notionProperty);

      expect(result).toBe("");
    });
  });

  describe("config", () => {
    it("generates correct database property configuration", () => {
      const config = titleCodec.config("Name");

      expect(config).toEqual({
        Name: {
          title: {},
        },
      });
    });

    it("generates config for different property names", () => {
      const config1 = titleCodec.config("Title");
      const config2 = titleCodec.config("Task Name");

      expect(config1).toEqual({ Title: { title: {} } });
      expect(config2).toEqual({ "Task Name": { title: {} } });
    });
  });

  describe("roundtrip parse/encode", () => {
    it("roundtrips successfully for simple strings", () => {
      const original = "My Page Title";

      const encoded = titleCodec.parse(original) as TitlePropertyPayload;
      const decoded = titleCodec.encode({
        title: encoded.title,
      } as any);

      expect(decoded).toBe(original);
    });

    it("roundtrips with trimming applied", () => {
      const input = "  Trimmed Title  ";
      const expected = "Trimmed Title";

      const encoded = titleCodec.parse(input) as TitlePropertyPayload;
      const decoded = titleCodec.encode({
        title: encoded.title,
      } as any);

      expect(decoded).toBe(expected);
    });

    it("roundtrips with special characters", () => {
      const original = "Title with 日本語 & émojis 🎉";

      const encoded = titleCodec.parse(original) as TitlePropertyPayload;
      const decoded = titleCodec.encode({
        title: encoded.title,
      } as any);

      expect(decoded).toBe(original);
    });
  });

  describe("integration with fixtures", () => {
    it("decodes fixture-like property structure", () => {
      const fixtureProperty: TitlePropertyResponse = {
        id: "obf_id_50",
        type: "title",
        title: [
          {
            type: "text",
            text: {
              content: "Playground",
              link: null,
            },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            plain_text: "Playground",
            href: null,
          },
        ],
      };

      const result = titleCodec.encode(fixtureProperty as any);

      expect(result).toBe("Playground");
    });
  });
});
