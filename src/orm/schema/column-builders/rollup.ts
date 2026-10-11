import { rollupCodec, type RollupPropertyResponse, type RollupValue } from "@/orm/codecs/computed/rollup";
import type { ColumnDef } from "../types";

type RollupColumnBuilder<TOptional extends boolean = true, TNullable extends boolean = false> = ColumnDef<
  RollupValue,
  TOptional,
  TNullable,
  never,
  RollupPropertyResponse
> & {
  optional: () => RollupColumnBuilder<true, TNullable>;
  nullable: () => RollupColumnBuilder<TOptional, true>;
};

function buildRollupColumnBuilder<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<RollupValue, TOptional, TNullable, never, RollupPropertyResponse>
): RollupColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildRollupColumnBuilder({
        ...def,
        isOptional: true as const,
      }),
    nullable: () =>
      buildRollupColumnBuilder({
        ...def,
        isNullable: true as const,
      }),
  };
}

/**
 * Read-only rollup column for existing databases. defineTable cannot create rollup properties.
 */
export function rollup(name: string): RollupColumnBuilder {
  return buildRollupColumnBuilder({
    name,
    codec: rollupCodec,
    isOptional: true as const,
    isNullable: false as const,
    propertyType: "rollup",
    isReadOnly: true,
  });
}
