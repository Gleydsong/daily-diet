import { loadEnv } from "./config/env";
import { buildApp } from "./app";

async function start() {
  const env = loadEnv();
  const app = await buildApp();

  await app.listen({
    host: "0.0.0.0",
    port: env.PORT,
  });

  console.log(`Server running on port ${env.PORT}`);
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
