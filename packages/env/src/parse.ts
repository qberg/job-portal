import * as v from "valibot";

export function parseEnv<TSchema extends v.GenericSchema>(
  schema: TSchema,
  input: unknown
): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, input);

  if (!result.success) {
    const issues = v.flatten(result.issues);
    const nested = issues.nested ?? {};
    const messages = Object.entries(nested)
      .map(([key, errs]) => `  ${key}: ${(errs ?? []).join(", ")}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${messages}`);
  }

  return result.output;
}
