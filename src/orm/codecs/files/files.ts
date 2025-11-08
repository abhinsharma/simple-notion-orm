import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildFilesProperty } from "@/factories/properties/database-page";
import type { FileInput } from "@/types/properties";
import { z } from "zod";

export type FilesPropertyPayload = {
  files: Array<
    | {
        type: "external";
        external: { url: string };
        name: string;
      }
    | {
        type: "file";
        file: { url: string };
        name: string;
      }
  >;
};

export type FilesPropertyResponse = {
  id?: string;
  type?: "files";
  files: Array<{
    name: string;
    type: "external" | "file";
    external?: {
      url: string;
    };
    file?: {
      url: string;
    };
  }>;
};

const fileInputSchema: z.ZodType<FileInput> = z.union([
  z.object({
    type: z.literal("external"),
    url: z.string().url(),
    name: z.string().optional(),
  }),
  z.object({
    type: z.literal("file"),
    url: z.string().url(),
    name: z.string().optional(),
  }),
]);

export const filesCodec = createNotionCodec<FileInput[], FilesPropertyPayload, FilesPropertyResponse>(
  z.codec(
    z.array(fileInputSchema),
    z.custom<FilesPropertyPayload>(),
    {
      decode: (value: FileInput[]): FilesPropertyPayload => {
        const { type: _type, ...payload } = buildFilesProperty(value);
        return payload;
      },
      encode: (property: FilesPropertyResponse): FileInput[] => {
        return property.files.map((file) => {
          const base = {
            name: file.name ?? "",
          };

          if (file.type === "file") {
            return {
              type: "file" as const,
              url: file.file?.url ?? "",
              ...(base.name ? { name: base.name } : {}),
            };
          }

          return {
            type: "external" as const,
            url: file.external?.url ?? "",
            ...(base.name ? { name: base.name } : {}),
          };
        });
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        files: {},
      },
    };
  }
);
