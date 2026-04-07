import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(1)
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }

  if (parsed.data.NODE_ENV !== "test" && !parsed.data.DATABASE_URL) {
    throw new Error("DATABASE_URL is required outside test environment.");
  }

  return parsed.data;
}
