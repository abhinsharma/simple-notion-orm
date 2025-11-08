import { phoneNumberCodec } from "@/orm/codecs";
import type {
  PhoneNumberPropertyPayload,
  PhoneNumberPropertyResponse,
} from "@/orm/codecs/primitives/phone-number";
import type { ColumnDef } from "../types";

type PhoneNumberColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  string | null,
  TOptional,
  TNullable,
  PhoneNumberPropertyPayload,
  PhoneNumberPropertyResponse
> & {
  optional: () => PhoneNumberColumnBuilder<true, TNullable>;
  nullable: () => PhoneNumberColumnBuilder<TOptional, true>;
  default: (value: string | null) => PhoneNumberColumnBuilder<TOptional, TNullable>;
};

function buildPhoneNumberColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<string | null, TOptional, TNullable, PhoneNumberPropertyPayload, PhoneNumberPropertyResponse>
): PhoneNumberColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildPhoneNumberColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
      }),
    nullable: () =>
      buildPhoneNumberColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
      }),
    default: (value: string | null) =>
      buildPhoneNumberColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
      }),
  };
}

export function phoneNumber(name: string): PhoneNumberColumnBuilder {
  return buildPhoneNumberColumn({
    name,
    codec: phoneNumberCodec,
    isOptional: false as const,
    isNullable: false as const,
  });
}
