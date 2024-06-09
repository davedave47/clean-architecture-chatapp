import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    schema: "./src/infras/db/config/schema.ts",
    out: "./src/infras/db/config/migrations",
    dialect: "postgresql"
})