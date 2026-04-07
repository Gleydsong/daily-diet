"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().default(3333),
    DATABASE_URL: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().min(1)
});
function loadEnv() {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
        throw new Error(`Invalid environment: ${parsed.error.message}`);
    }
    if (parsed.data.NODE_ENV !== "test" && !parsed.data.DATABASE_URL) {
        throw new Error("DATABASE_URL is required outside test environment.");
    }
    return parsed.data;
}
