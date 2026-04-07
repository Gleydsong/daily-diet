"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildKnexConfig = buildKnexConfig;
exports.createDatabaseConnection = createDatabaseConnection;
const node_path_1 = __importDefault(require("node:path"));
const knex_1 = require("knex");
const env_1 = require("../config/env");
function migrationsDirectory() {
    return node_path_1.default.resolve(process.cwd(), "src/db/migrations");
}
function buildKnexConfig(env) {
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
function createDatabaseConnection(env = (0, env_1.loadEnv)()) {
    return (0, knex_1.knex)(buildKnexConfig(env));
}
