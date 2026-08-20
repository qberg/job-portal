import { getDb } from "@jp/database/init";
import { schema } from "@jp/database/schema";
import { eq } from "drizzle-orm";

// better-auth authenticates against Valkey, which no FK constrains — a session can
// outlive its user row. Postgres is the sole authority on actor existence.
export async function citizenActorExists(
  citizenUserId: string
): Promise<boolean> {
  const [row] = await getDb()
    .select({ id: schema.citizenUser.id })
    .from(schema.citizenUser)
    .where(eq(schema.citizenUser.id, citizenUserId))
    .limit(1);
  return row !== undefined;
}
