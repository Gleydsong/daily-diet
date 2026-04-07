"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const zod_1 = require("zod");
const app_error_1 = require("./errors/app-error");
const auth_plugin_1 = __importDefault(require("./http/plugins/auth-plugin"));
const meals_routes_1 = require("./http/routes/meals-routes");
const sessions_routes_1 = require("./http/routes/sessions-routes");
const users_routes_1 = require("./http/routes/users-routes");
const knex_1 = require("./lib/knex");
async function buildApp(options) {
    const app = (0, fastify_1.default)();
    const db = options?.db ?? (0, knex_1.createDatabaseConnection)();
    await app.register(auth_plugin_1.default);
    await app.register((0, users_routes_1.usersRoutes)(db));
    await app.register((0, sessions_routes_1.sessionsRoutes)(db));
    await app.register((0, meals_routes_1.mealsRoutes)(db), { prefix: "/meals" });
    app.setErrorHandler((error, _request, reply) => {
        if (error instanceof app_error_1.AppError) {
            return reply.status(error.statusCode).send({
                code: "APP_ERROR",
                message: error.message
            });
        }
        if (error instanceof zod_1.ZodError) {
            return reply.status(400).send({
                code: "VALIDATION_ERROR",
                message: "Invalid request payload.",
                details: error.issues
            });
        }
        app.log.error(error);
        return reply.status(500).send({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unexpected server error."
        });
    });
    if (!options?.db) {
        app.addHook("onClose", async () => {
            await db.destroy();
        });
    }
    return app;
}
