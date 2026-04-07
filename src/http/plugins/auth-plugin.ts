import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import { loadEnv } from "../../config/env";
import { AppError } from "../../errors/app-error";

const authPlugin: FastifyPluginAsync = async (app) => {
  const env = loadEnv();

  await app.register(cookie);
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: "token",
      signed: false
    }
  });

  app.decorate("authenticate", async (request) => {
    try {
      await request.jwtVerify();
      request.currentUserId = request.user.id;
    } catch {
      throw new AppError("Unauthorized.", 401);
    }
  });
};

export default fp(authPlugin);
