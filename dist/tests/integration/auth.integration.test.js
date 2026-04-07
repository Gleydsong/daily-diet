"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const test_app_1 = require("../helpers/test-app");
(0, vitest_1.describe)("Auth integration", () => {
    let app;
    let db;
    (0, vitest_1.beforeAll)(async () => {
        const context = await (0, test_app_1.createTestContext)();
        app = context.app;
        db = context.db;
    });
    (0, vitest_1.beforeEach)(async () => {
        await (0, test_app_1.resetTables)(db);
    });
    (0, vitest_1.afterAll)(async () => {
        await app.close();
        await db.destroy();
    });
    (0, vitest_1.it)("should create a user and authenticate", async () => {
        const createResponse = await app.inject({
            method: "POST",
            url: "/users",
            payload: {
                name: "User One",
                email: "user.one@example.com",
                password: "123456"
            }
        });
        (0, vitest_1.expect)(createResponse.statusCode).toBe(201);
        const sessionResponse = await app.inject({
            method: "POST",
            url: "/sessions",
            payload: {
                email: "user.one@example.com",
                password: "123456"
            }
        });
        (0, vitest_1.expect)(sessionResponse.statusCode).toBe(200);
        (0, vitest_1.expect)(sessionResponse.headers["set-cookie"]).toBeDefined();
    });
    (0, vitest_1.it)("should deny authentication with invalid password", async () => {
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
        (0, vitest_1.expect)(sessionResponse.statusCode).toBe(401);
    });
});
