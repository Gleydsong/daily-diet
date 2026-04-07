"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = require("../lib/knex");
async function migrate() {
    const db = (0, knex_1.createDatabaseConnection)();
    try {
        await db.migrate.latest();
        // eslint-disable-next-line no-console
        console.log("Migrations applied successfully.");
    }
    finally {
        await db.destroy();
    }
}
migrate().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
});
