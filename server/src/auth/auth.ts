import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { loadEnv } from "../config/loadEnv.js";
import dotenv from "dotenv";
import { operatorAuthPlugin } from "./operatorAuthPlugin.js";
dotenv.config();
loadEnv();

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const password = process.env.PG_PASSWORD;

  if (!password) {
    throw new Error("Missing DATABASE_URL and PG_PASSWORD for Better Auth database connection");
  }

  const user = process.env.PG_USER ?? "authuser";
  const host = process.env.PG_HOST ?? "localhost";
  const port = process.env.PG_PORT ?? "5433";
  const database = process.env.PG_DATABASE ?? "metrodbAuth";

  return `postgresql://${encodeURIComponent(user ?? "")}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const betterAuthUrl = process.env.BETTER_AUTH_URL;

if (!betterAuthSecret) {
  throw new Error("Missing BETTER_AUTH_SECRET in environment");
}

if (!betterAuthUrl) {
  throw new Error("Missing BETTER_AUTH_URL in environment");
}

const pool = new Pool({
  connectionString: resolveDatabaseUrl(),
});

export const auth = betterAuth({
  database: pool,

  secret: betterAuthSecret,

  baseURL: betterAuthUrl,

  trustedOrigins: [
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS
      ?.split(",")
      .map((origin) => origin.trim()) ?? []),
  ],

  user: {
    additionalFields: {
      operatorId: {
        type: "number",
        required: true,
        input: false,
      },
    },
  },

  plugins: [ operatorAuthPlugin],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
});