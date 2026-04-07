import path from "node:path";
import { knex, type Knex } from "knex";
import type { AppEnv } from "../config/env";
import { loadEnv } from "../config/env";

function migrationsDirectory(): string {
  return path.resolve(process.cwd(), "src/db/migrations");
}

export function buildKnexConfig(env: AppEnv): Knex.Config {
  if (env.NODE_ENV === "test") {
    return {
      client: "sqlite3",
      connection: { filename: ":memory:" },
      pool: { min: 1, max: 1 },
      useNullAsDefault: true,
      migrations: {
        directory: migrationsDirectory(),
        extension: "ts",
        loadExtensions: [".ts"]
      }
    };
  }

  return {
    client: "pg",
    connection: env.DATABASE_URL,
    migrations: {
      directory: migrationsDirectory(),
      extension: "ts",
      loadExtensions: [".ts"]
    }
  };
}

export function createDatabaseConnection(env = loadEnv()): Knex {
  return knex(buildKnexConfig(env));
}
