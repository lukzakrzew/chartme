import type { ValueOf } from "type-fest";

export type LOG_TYPES = ValueOf<typeof LOG_TYPES>;
export const LOG_TYPES = {
  boolean: "boolean",
  number: "number",
} as const;

export const NO_CATEGORY = "No Category";
