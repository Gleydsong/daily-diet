import type { Knex } from "knex";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { UsersRepository } from "../../repositories/users-repository";
import { UsersService } from "../../services/users-service";

export function usersRoutes(db: Knex): FastifyPluginAsync {
  return async (app) => {
    const usersService = new UsersService(new UsersRepository(db));

    app.post("/users", async (request, reply) => {
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6)
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
