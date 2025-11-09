import { selectCodec } from "@/orm/codecs";
import type { SelectPropertyPayload, SelectPropertyResponse } from "@/orm/codecs/options/select";
import type { SelectOptionInput } from "@/types/properties";
import type { ColumnDef } from "../types";
import { buildOptionConfig, normalizeSelectOptions, type NormalizedSelectOptions, type SelectOptionConfigInput, type SelectOptionUnion } from "./option-utils";

type SelectValue<TOptions extends readonly SelectOptionInput[] | undefined, TAllowCustom extends boolean> = SelectOptionUnion<TOptions, TAllowCustom> | null;

type BaseSelectColumnDef<TOptional extends boolean, TNullable extends boolean> = ColumnDef<
  SelectOptionInput | null,
  TOptional,
  TNullable,
  SelectPropertyPayload,
  SelectPropertyResponse
>;

type SelectColumnBuilder<
  TOptional extends boolean = false,
  TNullable extends boolean = false,
  TOptions extends readonly SelectOptionInput[] | undefined = undefined,
  TAllowCustom extends boolean = true,
> = ColumnDef<SelectValue<TOptions, TAllowCustom>, TOptional, TNullable, SelectPropertyPayload, SelectPropertyResponse> & {
  optional: () => SelectColumnBuilder<true, TNullable, TOptions, TAllowCustom>;
  nullable: () => SelectColumnBuilder<TOptional, true, TOptions, TAllowCustom>;
  default: (value: SelectValue<TOptions, TAllowCustom>) => SelectColumnBuilder<TOptional, TNullable, TOptions, TAllowCustom>;
  options: <const Options extends readonly SelectOptionConfigInput[]>(
    options: Options
  ) => SelectColumnBuilder<TOptional, TNullable, NormalizedSelectOptions<Options>, false>;
  allowCustomOptions: () => SelectColumnBuilder<TOptional, TNullable, TOptions, true>;
};

type SelectColumnMeta<TOptions extends readonly SelectOptionInput[] | undefined, TAllowCustom extends boolean> = {
  options?: TOptions;
  allowCustomOptions: TAllowCustom;
};

function buildSelectColumn<
  TOptional extends boolean,
  TNullable extends boolean,
  TOptions extends readonly SelectOptionInput[] | undefined,
  TAllowCustom extends boolean,
>(
  def: BaseSelectColumnDef<TOptional, TNullable>,
  meta: SelectColumnMeta<TOptions, TAllowCustom>
): SelectColumnBuilder<TOptional, TNullable, TOptions, TAllowCustom> {
  const configOverride = buildOptionConfig("select", meta.options);
  const baseDef: BaseSelectColumnDef<TOptional, TNullable> = {
    ...def,
    ...(configOverride ? { config: configOverride } : {}),
  };
  const columnDef = baseDef as unknown as ColumnDef<SelectValue<TOptions, TAllowCustom>, TOptional, TNullable, SelectPropertyPayload, SelectPropertyResponse>;

  return {
    ...columnDef,
    optional: () =>
      buildSelectColumn<true, TNullable, TOptions, TAllowCustom>(
        {
          ...baseDef,
          isOptional: true as const,
        },
        meta
      ),
    nullable: () =>
      buildSelectColumn<TOptional, true, TOptions, TAllowCustom>(
        {
          ...baseDef,
          isNullable: true as const,
        },
        meta
      ),
    default: (value: SelectValue<TOptions, TAllowCustom>) =>
      buildSelectColumn<TOptional, TNullable, TOptions, TAllowCustom>(
        {
          ...baseDef,
          defaultValue: value,
        },
        meta
      ),
    options: <const Options extends readonly SelectOptionConfigInput[]>(options: Options) => {
      const normalized = normalizeSelectOptions(options);
      return buildSelectColumn<TOptional, TNullable, NormalizedSelectOptions<Options>, false>(
        {
          ...baseDef,
          defaultValue: baseDef.defaultValue,
        },
        { options: normalized, allowCustomOptions: false as const }
      );
    },
    allowCustomOptions: () =>
      buildSelectColumn<TOptional, TNullable, TOptions, true>(
        {
          ...baseDef,
          defaultValue: baseDef.defaultValue,
        },
        { options: meta.options, allowCustomOptions: true as const }
      ),
  };
}

export function select(name: string): SelectColumnBuilder {
  return buildSelectColumn(
    {
      name,
      codec: selectCodec,
      isOptional: false as const,
      isNullable: false as const,
      propertyType: "select",
    },
    { allowCustomOptions: true as const }
  );
}
