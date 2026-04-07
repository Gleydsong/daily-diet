"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsRoutes = sessionsRoutes;
const zod_1 = require("zod");
const env_1 = require("../../config/env");
const users_repository_1 = require("../../repositories/users-repository");
const users_service_1 = require("../../services/users-service");
function sessionsRoutes(db) {
    return async (app) => {
        const usersService = new users_service_1.UsersService(new users_repository_1.UsersRepository(db));
        const env = (0, env_1.loadEnv)();
        app.post("/sessions", async (request, reply) => {
            const schema = zod_1.z.object({
                email: zod_1.z.string().email(),
                password: zod_1.z.string().min(6)
            });
            const { email, password } = schema.parse(request.body);
            const user = await usersService.authenticate({ email, password });
            const token = await reply.jwtSign({ id: user.id });
            reply.setCookie("token", token, {
                path: "/",
                httpOnly: true,
                sameSite: "lax",
                secure: env.NODE_ENV === "production"
            });
            return reply.status(200).send({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        });
    };
}
