import { buildFormulaColumn } from "@/factories/properties/database-schema";
import { formulaCodec, type FormulaPropertyResponse, type FormulaValue } from "@/orm/codecs/computed/formula";
import type { ColumnDef } from "../types";

type FormulaColumnBuilder<TOptional extends boolean = true, TNullable extends boolean = true> = ColumnDef<
  FormulaValue,
  TOptional,
  TNullable,
  never,
  FormulaPropertyResponse
> & {
  optional: () => FormulaColumnBuilder<true, TNullable>;
  nullable: () => FormulaColumnBuilder<TOptional, true>;
};

function buildFormulaColumnBuilder<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<FormulaValue, TOptional, TNullable, never, FormulaPropertyResponse>
): FormulaColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildFormulaColumnBuilder({
        ...def,
        isOptional: true as const,
      }),
    nullable: () =>
      buildFormulaColumnBuilder({
        ...def,
        isNullable: true as const,
      }),
  };
}

/**
 * Read-only formula column. Pass an expression when defineTable should create the property.
 */
export function formula(name: string, options?: { expression?: string }): FormulaColumnBuilder {
  const expression = options?.expression;
  return buildFormulaColumnBuilder({
    name,
    codec: formulaCodec,
    isOptional: true as const,
    isNullable: true as const,
    propertyType: "formula",
    isReadOnly: true,
    ...(expression ? { config: () => ({ [name]: buildFormulaColumn(expression) }) } : {}),
  });
}
