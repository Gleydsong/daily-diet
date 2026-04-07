import "fastify";
import "@fastify/jwt";

declare module "fastify" {
  interface FastifyRequest {
    currentUserId: string;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
    };
  }
}
