import type { Knex } from "knex";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { MealsRepository } from "../../repositories/meals-repository";
import { MealsService } from "../../services/meals-service";

export function mealsRoutes(db: Knex): FastifyPluginAsync {
  return async (app) => {
    const mealsService = new MealsService(new MealsRepository(db));

    app.addHook("preHandler", app.authenticate);

    app.post("/", async (request, reply) => {
      const schema = z.object({
        name: z.string().min(1),
        description: z.string().nullable().optional(),
        occurredAt: z.iso.datetime(),
        isOnDiet: z.boolean()
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
      const paramsSchema = z.object({ id: z.uuid() });
      const { id } = paramsSchema.parse(request.params);

      const meal = await mealsService.getById(id, request.currentUserId);
      return { meal };
    });

    app.put("/:id", async (request, reply) => {
      const paramsSchema = z.object({ id: z.uuid() });
      const bodySchema = z.object({
        name: z.string().min(1),
        description: z.string().nullable().optional(),
        occurredAt: z.iso.datetime(),
        isOnDiet: z.boolean()
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
      const paramsSchema = z.object({ id: z.uuid() });
      const { id } = paramsSchema.parse(request.params);

      await mealsService.delete({
        id,
        userId: request.currentUserId
      });

      return reply.status(204).send();
    });
  };
}
