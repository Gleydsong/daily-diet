"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const test_app_1 = require("../helpers/test-app");
function authCookieFromSetCookieHeader(setCookieHeader) {
    if (!setCookieHeader) {
        return "";
    }
    const cookieValue = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
    return cookieValue.split(";")[0];
}
async function createUserAndSession(app, email) {
    await app.inject({
        method: "POST",
        url: "/users",
        payload: {
            name: "Daily User",
            email,
            password: "123456"
        }
    });
    const sessionResponse = await app.inject({
        method: "POST",
        url: "/sessions",
        payload: {
            email,
            password: "123456"
        }
    });
    return authCookieFromSetCookieHeader(sessionResponse.headers["set-cookie"]);
}
(0, vitest_1.describe)("Meals e2e", () => {
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
    (0, vitest_1.it)("should execute meals flow and return metrics", async () => {
        const cookie = await createUserAndSession(app, "flow@example.com");
        const mealOneResponse = await app.inject({
            method: "POST",
            url: "/meals",
            headers: { cookie },
            payload: {
                name: "Breakfast",
                description: "Eggs",
                occurredAt: "2026-04-07T08:00:00.000Z",
                isOnDiet: true
            }
        });
        const mealTwoResponse = await app.inject({
            method: "POST",
            url: "/meals",
            headers: { cookie },
            payload: {
                name: "Snack",
                description: "Chocolate",
                occurredAt: "2026-04-07T10:00:00.000Z",
                isOnDiet: false
            }
        });
        const mealThreeResponse = await app.inject({
            method: "POST",
            url: "/meals",
            headers: { cookie },
            payload: {
                name: "Lunch",
                description: "Rice and chicken",
                occurredAt: "2026-04-07T12:00:00.000Z",
                isOnDiet: true
            }
        });
        (0, vitest_1.expect)(mealOneResponse.statusCode).toBe(201);
        (0, vitest_1.expect)(mealTwoResponse.statusCode).toBe(201);
        (0, vitest_1.expect)(mealThreeResponse.statusCode).toBe(201);
        const listResponse = await app.inject({
            method: "GET",
            url: "/meals",
            headers: { cookie }
        });
        (0, vitest_1.expect)(listResponse.statusCode).toBe(200);
        (0, vitest_1.expect)(listResponse.json().meals).toHaveLength(3);
        const metricsResponse = await app.inject({
            method: "GET",
            url: "/meals/metrics",
            headers: { cookie }
        });
        (0, vitest_1.expect)(metricsResponse.statusCode).toBe(200);
        (0, vitest_1.expect)(metricsResponse.json().metrics).toEqual({
            totalMeals: 3,
            totalOnDiet: 2,
            totalOffDiet: 1,
            bestOnDietStreak: 1
        });
    });
    (0, vitest_1.it)("should deny access without token and with invalid token", async () => {
        const withoutToken = await app.inject({
            method: "GET",
            url: "/meals"
        });
        const invalidToken = await app.inject({
            method: "GET",
            url: "/meals",
            headers: { cookie: "token=invalid" }
        });
        (0, vitest_1.expect)(withoutToken.statusCode).toBe(401);
        (0, vitest_1.expect)(invalidToken.statusCode).toBe(401);
    });
    (0, vitest_1.it)("should block access to meal from another user", async () => {
        const ownerCookie = await createUserAndSession(app, "owner@example.com");
        const otherCookie = await createUserAndSession(app, "other@example.com");
        const mealResponse = await app.inject({
            method: "POST",
            url: "/meals",
            headers: { cookie: ownerCookie },
            payload: {
                name: "Owner meal",
                description: "private",
                occurredAt: "2026-04-07T18:00:00.000Z",
                isOnDiet: true
            }
        });
        const mealId = mealResponse.json().meal.id;
        const getFromOtherUser = await app.inject({
            method: "GET",
            url: `/meals/${mealId}`,
            headers: { cookie: otherCookie }
        });
        const deleteFromOtherUser = await app.inject({
            method: "DELETE",
            url: `/meals/${mealId}`,
            headers: { cookie: otherCookie }
        });
        (0, vitest_1.expect)(getFromOtherUser.statusCode).toBe(404);
        (0, vitest_1.expect)(deleteFromOtherUser.statusCode).toBe(404);
    });
});
