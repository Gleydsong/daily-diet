import Fastify from "fastify";
import type { Knex } from "knex";
import { ZodError } from "zod";
import { AppError } from "./errors/app-error";
import authPlugin from "./http/plugins/auth-plugin";
import { mealsRoutes } from "./http/routes/meals-routes";
import { sessionsRoutes } from "./http/routes/sessions-routes";
import { usersRoutes } from "./http/routes/users-routes";
import { createDatabaseConnection } from "./lib/knex";

type BuildAppOptions = {
  db?: Knex;
};

export async function buildApp(options?: BuildAppOptions) {
  const app = Fastify();
  const db = options?.db ?? createDatabaseConnection();

  await app.register(authPlugin);
  await app.register(usersRoutes(db));
  await app.register(sessionsRoutes(db));
  await app.register(mealsRoutes(db), { prefix: "/meals" });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        code: "APP_ERROR",
        message: error.message
      });
    }

    if (error instanceof ZodError) {
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
