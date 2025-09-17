        import type { Config } from "drizzle-kit";
        import * as dotenv from "dotenv";
        dotenv.config();

        export default {
          schema: "./db/schema.ts", // or your schema file path
          out: "./db/migrations",
          driver: "pg", // or your database driver (e.g., "mysql", "sqlite")
          dbCredentials: {
            connectionString: process.env.DATABASE_URL as string,
          },
        } satisfies Config;