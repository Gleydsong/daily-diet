import type { Knex } from "knex";
import type { FastifyInstance } from "fastify";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTestContext, resetTables } from "../helpers/test-app";

describe("Auth integration", () => {
  let app: FastifyInstance;
  let db: Knex;

  beforeAll(async () => {
    const context = await createTestContext();
    app = context.app;
    db = context.db;
  });

  beforeEach(async () => {
    await resetTables(db);
  });

  afterAll(async () => {
    await app.close();
    await db.destroy();
  });

  it("should create a user and authenticate", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/users",
      payload: {
        name: "User One",
        email: "user.one@example.com",
        password: "123456"
      }
    });

    expect(createResponse.statusCode).toBe(201);

    const sessionResponse = await app.inject({
      method: "POST",
      url: "/sessions",
      payload: {
        email: "user.one@example.com",
        password: "123456"
      }
    });

    expect(sessionResponse.statusCode).toBe(200);
    expect(sessionResponse.headers["set-cookie"]).toBeDefined();
  });

  it("should deny authentication with invalid password", async () => {
    await app.inject({
      method: "POST",
      url: "/users",
      payload: {
        name: "User Two",
        email: "user.two@example.com",
        password: "123456"
      }
    });

    const sessionResponse = await app.inject({
      method: "POST",
      url: "/sessions",
      payload: {
        email: "user.two@example.com",
        password: "wrong-password"
      }
    });

    expect(sessionResponse.statusCode).toBe(401);
  });
});
