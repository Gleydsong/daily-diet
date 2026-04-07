"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_1 = __importDefault(require("@fastify/cookie"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const env_1 = require("../../config/env");
const app_error_1 = require("../../errors/app-error");
const authPlugin = async (app) => {
    const env = (0, env_1.loadEnv)();
    await app.register(cookie_1.default);
    await app.register(jwt_1.default, {
        secret: env.JWT_SECRET,
        cookie: {
            cookieName: "token",
            signed: false
        }
    });
    app.decorate("authenticate", async (request, _reply) => {
        try {
            await request.jwtVerify();
            request.currentUserId = request.user.id;
        }
        catch {
            throw new app_error_1.AppError("Unauthorized.", 401);
        }
    });
};
exports.default = (0, fastify_plugin_1.default)(authPlugin);
