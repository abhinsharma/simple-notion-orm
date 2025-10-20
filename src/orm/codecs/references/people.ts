import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildPeopleProperty } from "@/factories/properties/database-page";
import { z } from "zod";

export type PeoplePropertyPayload = {
  people: Array<{ id: string }>;
};

export type PeoplePropertyResponse = {
  id?: string;
  type?: "people";
  people: Array<{
    id: string;
    object?: "user";
  }>;
};

export const peopleCodec = createNotionCodec(
  z.codec(
    z.array(z.string()),
    z.custom<PeoplePropertyPayload>(),
    {
      decode: (value: string[]): PeoplePropertyPayload => {
        const { type: _type, ...payload } = buildPeopleProperty(value);
        return payload;
      },
      encode: (property: PeoplePropertyResponse): string[] => {
        return property.people.map((person) => person.id);
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        people: {},
      },
    };
  }
);
