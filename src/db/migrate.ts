import { createDatabaseConnection } from "../lib/knex";

async function migrate() {
  const db = createDatabaseConnection();

  try {
    await db.migrate.latest();
    // eslint-disable-next-line no-console
    console.log("Migrations applied successfully.");
  } finally {
    await db.destroy();
  }
}

migrate().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
