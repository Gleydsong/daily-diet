import type { Knex } from "knex";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { loadEnv } from "../../config/env";
import { UsersRepository } from "../../repositories/users-repository";
import { UsersService } from "../../services/users-service";

export function sessionsRoutes(db: Knex): FastifyPluginAsync {
  return async (app) => {
    const usersService = new UsersService(new UsersRepository(db));
    const env = loadEnv();

    app.post("/sessions", async (request, reply) => {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6)
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

    app.delete("/sessions", async (_request, reply) => {
      reply.clearCookie("token", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: env.NODE_ENV === "production"
      });

      return reply.status(204).send();
    });
  };
}
