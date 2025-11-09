import { multiSelectCodec } from "@/orm/codecs";
import type { MultiSelectPropertyPayload, MultiSelectPropertyResponse } from "@/orm/codecs/options/multi-select";
import type { SelectOptionInput } from "@/types/properties";
import type { ColumnDef } from "../types";
import {
  buildOptionConfig,
  normalizeSelectOptions,
  type NormalizedSelectOptions,
  type SelectOptionConfigInput,
  type SelectOptionUnion,
} from "./option-utils";

type MultiSelectValue<
  TOptions extends readonly SelectOptionInput[] | undefined,
  TAllowCustom extends boolean
> = Array<SelectOptionUnion<TOptions, TAllowCustom>>;

type BaseMultiSelectColumnDef<TOptional extends boolean, TNullable extends boolean> = ColumnDef<
  SelectOptionInput[],
  TOptional,
  TNullable,
  MultiSelectPropertyPayload,
  MultiSelectPropertyResponse
>;

type MultiSelectColumnBuilder<
  TOptional extends boolean = false,
  TNullable extends boolean = false,
  TOptions extends readonly SelectOptionInput[] | undefined = undefined,
  TAllowCustom extends boolean = true
> = ColumnDef<
  MultiSelectValue<TOptions, TAllowCustom>,
  TOptional,
  TNullable,
  MultiSelectPropertyPayload,
  MultiSelectPropertyResponse
> & {
  optional: () => MultiSelectColumnBuilder<true, TNullable, TOptions, TAllowCustom>;
  nullable: () => MultiSelectColumnBuilder<TOptional, true, TOptions, TAllowCustom>;
  default: (value: MultiSelectValue<TOptions, TAllowCustom>) => MultiSelectColumnBuilder<TOptional, TNullable, TOptions, TAllowCustom>;
  options: <const Options extends readonly SelectOptionConfigInput[]>(
    options: Options
  ) => MultiSelectColumnBuilder<TOptional, TNullable, NormalizedSelectOptions<Options>, false>;
  allowCustomOptions: () => MultiSelectColumnBuilder<TOptional, TNullable, TOptions, true>;
};

type MultiSelectMeta<TOptions extends readonly SelectOptionInput[] | undefined, TAllowCustom extends boolean> = {
  options?: TOptions;
  allowCustomOptions: TAllowCustom;
};

function buildMultiSelectColumn<
  TOptional extends boolean,
  TNullable extends boolean,
  TOptions extends readonly SelectOptionInput[] | undefined,
  TAllowCustom extends boolean
>(
  def: BaseMultiSelectColumnDef<TOptional, TNullable>,
  meta: MultiSelectMeta<TOptions, TAllowCustom>
): MultiSelectColumnBuilder<TOptional, TNullable, TOptions, TAllowCustom> {
  const configOverride = buildOptionConfig("multi_select", meta.options);
  const baseDef: BaseMultiSelectColumnDef<TOptional, TNullable> = {
    ...def,
    ...(configOverride ? { config: configOverride } : {}),
  };
  const columnDef = baseDef as unknown as ColumnDef<
    MultiSelectValue<TOptions, TAllowCustom>,
    TOptional,
    TNullable,
    MultiSelectPropertyPayload,
    MultiSelectPropertyResponse
  >;

  return {
    ...columnDef,
    optional: () =>
      buildMultiSelectColumn<
        true,
        TNullable,
        TOptions,
        TAllowCustom
      >(
        {
          ...baseDef,
          isOptional: true as const,
        },
        meta
      ),
    nullable: () =>
      buildMultiSelectColumn<
        TOptional,
        true,
        TOptions,
        TAllowCustom
      >(
        {
          ...baseDef,
          isNullable: true as const,
        },
        meta
      ),
    default: (value: MultiSelectValue<TOptions, TAllowCustom>) =>
      buildMultiSelectColumn<
        TOptional,
        TNullable,
        TOptions,
        TAllowCustom
      >(
        {
          ...baseDef,
          defaultValue: value,
        },
        meta
      ),
    options: <const Options extends readonly SelectOptionConfigInput[]>(options: Options) => {
      const normalized = normalizeSelectOptions(options);
      return buildMultiSelectColumn<
        TOptional,
        TNullable,
        NormalizedSelectOptions<Options>,
        false
      >(
        {
          ...baseDef,
          defaultValue: baseDef.defaultValue,
        },
        { options: normalized, allowCustomOptions: false as const }
      );
    },
    allowCustomOptions: () =>
      buildMultiSelectColumn<
        TOptional,
        TNullable,
        TOptions,
        true
      >(
        {
          ...baseDef,
          defaultValue: baseDef.defaultValue,
        },
        { options: meta.options, allowCustomOptions: true as const }
      ),
  };
}

export function multiSelect(name: string): MultiSelectColumnBuilder {
  return buildMultiSelectColumn({
    name,
    codec: multiSelectCodec,
    isOptional: false as const,
    isNullable: false as const,
    propertyType: "multi_select",
  }, { allowCustomOptions: true as const });
}
