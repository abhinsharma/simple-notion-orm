import { emailCodec } from "@/orm/codecs";
import type { EmailPropertyPayload, EmailPropertyResponse } from "@/orm/codecs/primitives/email";
import type { ColumnDef } from "../types";

type EmailColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  string | null,
  TOptional,
  TNullable,
  EmailPropertyPayload,
  EmailPropertyResponse
> & {
  optional: () => EmailColumnBuilder<true, TNullable>;
  nullable: () => EmailColumnBuilder<TOptional, true>;
  default: (value: string | null) => EmailColumnBuilder<TOptional, TNullable>;
};

function buildEmailColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<string | null, TOptional, TNullable, EmailPropertyPayload, EmailPropertyResponse>
): EmailColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildEmailColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    nullable: () =>
      buildEmailColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    default: (value: string | null) =>
      buildEmailColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
        propertyType: def.propertyType,
      }),
  };
}

export function email(name: string): EmailColumnBuilder {
  return buildEmailColumn({
    name,
    codec: emailCodec,
    isOptional: false as const,
    isNullable: false as const,
    propertyType: "email",
  });
}
