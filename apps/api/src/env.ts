import { parseEnv } from "@jp/env/parse";
import {
  authSchema,
  citizenAuthSchema,
  databaseSchema,
  redisSchema,
} from "@jp/env/server";
import * as v from "valibot";

const baseSchema = v.object({
  PORT: v.pipe(
    v.optional(v.string(), "3001"),
    v.transform((s) => Number.parseInt(s, 10)),
    v.number()
  ),
  ...authSchema.entries,
  ...citizenAuthSchema.entries,
  ...databaseSchema.entries,
  ...redisSchema.entries,
});

type BaseEnv = v.InferOutput<typeof baseSchema>;

// Isolation invariant: the citizen instance must not share the staff secret.
const secretsAreIsolated = (input: BaseEnv): boolean =>
  input.CITIZEN_AUTH_SECRET !== input.AUTH_SECRET;

const schema = v.pipe(
  baseSchema,
  v.check(
    secretsAreIsolated,
    "CITIZEN_AUTH_SECRET must differ from AUTH_SECRET (auth isolation)"
  )
);

export type Env = v.InferOutput<typeof schema>;
export const env: Env = parseEnv(schema, process.env);
