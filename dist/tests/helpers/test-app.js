"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestContext = createTestContext;
exports.resetTables = resetTables;
const app_1 = require("../../src/app");
const env_1 = require("../../src/config/env");
const knex_1 = require("../../src/lib/knex");
async function createTestContext() {
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = "test-secret";
    const db = (0, knex_1.createDatabaseConnection)((0, env_1.loadEnv)());
    await db.migrate.latest();
    const app = await (0, app_1.buildApp)({ db });
    return { app, db };
}
async function resetTables(db) {
    await db("meals").del();
    await db("users").del();
}
