"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mealsRoutes = mealsRoutes;
const zod_1 = require("zod");
const meals_repository_1 = require("../../repositories/meals-repository");
const meals_service_1 = require("../../services/meals-service");
function mealsRoutes(db) {
    return async (app) => {
        const mealsService = new meals_service_1.MealsService(new meals_repository_1.MealsRepository(db));
        app.addHook("preHandler", app.authenticate);
        app.post("/", async (request, reply) => {
            const schema = zod_1.z.object({
                name: zod_1.z.string().min(1),
                description: zod_1.z.string().nullable().optional(),
                occurredAt: zod_1.z.string().datetime(),
                isOnDiet: zod_1.z.boolean()
            });
            const body = schema.parse(request.body);
            const meal = await mealsService.create({
                userId: request.currentUserId,
                name: body.name,
                description: body.description ?? null,
                occurredAt: new Date(body.occurredAt),
                isOnDiet: body.isOnDiet
            });
            return reply.status(201).send({ meal });
        });
        app.get("/", async (request) => {
            const meals = await mealsService.listByUser(request.currentUserId);
            return { meals };
        });
        app.get("/metrics", async (request) => {
            const metrics = await mealsService.metrics(request.currentUserId);
            return { metrics };
        });
        app.get("/:id", async (request) => {
            const paramsSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
            const { id } = paramsSchema.parse(request.params);
            const meal = await mealsService.getById(id, request.currentUserId);
            return { meal };
        });
        app.put("/:id", async (request, reply) => {
            const paramsSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
            const bodySchema = zod_1.z.object({
                name: zod_1.z.string().min(1),
                description: zod_1.z.string().nullable().optional(),
                occurredAt: zod_1.z.string().datetime(),
                isOnDiet: zod_1.z.boolean()
            });
            const { id } = paramsSchema.parse(request.params);
            const body = bodySchema.parse(request.body);
            await mealsService.update({
                id,
                userId: request.currentUserId,
                name: body.name,
                description: body.description ?? null,
                occurredAt: new Date(body.occurredAt),
                isOnDiet: body.isOnDiet
            });
            return reply.status(204).send();
        });
        app.delete("/:id", async (request, reply) => {
            const paramsSchema = zod_1.z.object({ id: zod_1.z.string().uuid() });
            const { id } = paramsSchema.parse(request.params);
            await mealsService.delete({
                id,
                userId: request.currentUserId
            });
            return reply.status(204).send();
        });
    };
}
