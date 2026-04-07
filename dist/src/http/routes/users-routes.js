"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRoutes = usersRoutes;
const zod_1 = require("zod");
const users_repository_1 = require("../../repositories/users-repository");
const users_service_1 = require("../../services/users-service");
function usersRoutes(db) {
    return async (app) => {
        const usersService = new users_service_1.UsersService(new users_repository_1.UsersRepository(db));
        app.post("/users", async (request, reply) => {
            const schema = zod_1.z.object({
                name: zod_1.z.string().min(1),
                email: zod_1.z.string().email(),
                password: zod_1.z.string().min(6)
            });
            const { name, email, password } = schema.parse(request.body);
            const user = await usersService.create({ name, email, password });
            return reply.status(201).send({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        });
    };
}
