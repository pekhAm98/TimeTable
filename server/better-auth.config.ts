
import { betterAuth } from "better-auth";
import dotenv from "dotenv";

dotenv.config();
console.log({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  // other options...
});