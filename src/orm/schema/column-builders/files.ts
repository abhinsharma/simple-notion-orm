import { filesCodec } from "@/orm/codecs";
import type { FilesPropertyPayload, FilesPropertyResponse } from "@/orm/codecs/files/files";
import type { FileInput } from "@/types/properties";
import type { ColumnDef } from "../types";

type FilesColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  FileInput[],
  TOptional,
  TNullable,
  FilesPropertyPayload,
  FilesPropertyResponse
> & {
  optional: () => FilesColumnBuilder<true, TNullable>;
  nullable: () => FilesColumnBuilder<TOptional, true>;
  default: (value: FileInput[]) => FilesColumnBuilder<TOptional, TNullable>;
};

function buildFilesColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<FileInput[], TOptional, TNullable, FilesPropertyPayload, FilesPropertyResponse>
): FilesColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildFilesColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: cloneArray(def.defaultValue),
      }),
    nullable: () =>
      buildFilesColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: cloneArray(def.defaultValue),
      }),
    default: (value: FileInput[]) =>
      buildFilesColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: cloneArray(value),
      }),
  };
}

function cloneArray<T>(value?: T[]): T[] | undefined {
  if (!value) {
    return value;
  }
  return value.map((item) => {
    if (item && typeof item === "object") {
      return { ...(item as Record<string, unknown>) } as T;
    }
    return item;
  });
}

export function files(name: string): FilesColumnBuilder {
  return buildFilesColumn({
    name,
    codec: filesCodec,
    isOptional: false as const,
    isNullable: false as const,
  });
}
