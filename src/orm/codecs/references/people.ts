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

type PersonReference = { id: string };

export const peopleCodec = createNotionCodec<PersonReference[], PeoplePropertyPayload, PeoplePropertyResponse>(
  z.codec(
    z.array(
      z.object({
        id: z.string(),
      })
    ),
    z.custom<PeoplePropertyPayload>(),
    {
      decode: (value: PersonReference[]): PeoplePropertyPayload => {
        const { type: _type, ...payload } = buildPeopleProperty(value);
        return payload;
      },
      encode: (property: PeoplePropertyResponse): PersonReference[] => {
        return property.people.map((person) => ({
          id: person.id,
        }));
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
