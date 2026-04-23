"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const app_1 = require("./app");
async function start() {
    const env = (0, env_1.loadEnv)();
    const app = await (0, app_1.buildApp)();
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
