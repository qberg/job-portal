import { parseEnv } from "@jp/env/parse";
import { databaseSchema } from "@jp/env/server";
import * as v from "valibot";

const baseSchema = v.object({
  PORT: v.pipe(
    v.optional(v.string(), "3001"),
    v.transform((s) => Number.parseInt(s, 10)),
    v.number()
  ),
  ...databaseSchema.entries,
});

const schema = v.pipe(baseSchema);

export type Env = v.InferOutput<typeof schema>;
export const env: Env = parseEnv(schema, process.env);
