import type { SelectOptionInput } from "@/types/properties";

export type SelectOptionConfigInput<Name extends string = string> = Name | ({ name: Name } & Omit<SelectOptionInput, "name">);

type NormalizedTuple<Options extends readonly SelectOptionConfigInput[]> = {
  [Index in keyof Options]: Options[Index] extends string ? { name: Options[Index] } : Options[Index];
};

export type NormalizedSelectOptions<Options extends readonly SelectOptionConfigInput[]> =
  Readonly<NormalizedTuple<Options>> extends infer Result ? (Result extends readonly SelectOptionInput[] ? Result : never) : never;

export type SelectOptionUnion<TOptions extends readonly SelectOptionInput[] | undefined, TAllowCustom extends boolean> = TAllowCustom extends true
  ? SelectOptionInput
  : TOptions extends readonly SelectOptionInput[]
    ? TOptions[number]
    : SelectOptionInput;

export function normalizeSelectOptions<const Options extends readonly SelectOptionConfigInput[]>(options: Options): NormalizedSelectOptions<Options> {
  return options.map((option) => (typeof option === "string" ? { name: option } : option)) as NormalizedSelectOptions<Options>;
}

export function buildOptionConfig(
  property: "select" | "multi_select",
  options?: readonly SelectOptionInput[]
): ((name: string) => Record<string, unknown>) | undefined {
  if (!options || options.length === 0) {
    return undefined;
  }

  return (name: string) => ({
    [name]: {
      [property]: {
        options: options.map((option) => {
          if (!option.name) {
            throw new Error(`Select option for '${name}' must include a 'name' field`);
          }

          return {
            name: option.name,
            ...(option.color ? { color: option.color } : {}),
            ...(option.description !== undefined ? { description: option.description } : {}),
          };
        }),
      },
    },
  });
}
