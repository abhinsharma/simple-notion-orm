/**
 * ORM Codec exports
 *
 * Codecs provide bi-directional mappings between app-layer values and Notion property payloads.
 * Each codec handles validation (Zod), encoding (app → Notion), decoding (Notion → app),
 * and configuration (database schema generation).
 */

// Base types and helpers
export { type NotionCodec, createNotionCodec } from "./base/codec";

// Text codecs
export { titleCodec, type TitlePropertyPayload, type TitlePropertyResponse } from "./text/title";
export { richTextCodec, type RichTextPropertyPayload, type RichTextPropertyResponse } from "./text/rich-text";

// Primitive codecs
export { numberCodec } from "./primitives/number";
export { dateCodec } from "./primitives/date";
export { checkboxCodec } from "./primitives/checkbox";
export { urlCodec } from "./primitives/url";
export { emailCodec } from "./primitives/email";
export { phoneNumberCodec } from "./primitives/phone-number";

// Option codecs
export { selectCodec } from "./options/select";
export { multiSelectCodec } from "./options/multi-select";
export { statusCodec } from "./options/status";

// Reference codecs
export { peopleCodec } from "./references/people";
export { relationCodec } from "./references/relation";

// File codecs
export { filesCodec } from "./files/files";
