import type { Knex } from "knex";
import { buildApp } from "../../src/app";
import { loadEnv } from "../../src/config/env";
import { createDatabaseConnection } from "../../src/lib/knex";

export async function createTestContext(): Promise<{
  app: Awaited<ReturnType<typeof buildApp>>;
  db: Knex;
}> {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-secret";

  const db = createDatabaseConnection(loadEnv());
  await db.migrate.latest();

  const app = await buildApp({ db });

  return { app, db };
}

export async function resetTables(db: Knex): Promise<void> {
  await db("meals").del();
  await db("users").del();
}
