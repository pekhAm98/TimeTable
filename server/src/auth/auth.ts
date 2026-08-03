import { betterAuth } from "better-auth";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,

  emailAndPassword: {
    enabled: true,
  },

  secret: process.env.BETTER_AUTH_SECRET!,

  baseURL: process.env.BETTER_AUTH_URL!,

  trustedOrigins: [
    "http://localhost:3000",
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
});