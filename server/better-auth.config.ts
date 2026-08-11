import { betterAuth } from "better-auth";
import dotenv from "dotenv";

dotenv.config();

const trustedOrigins =
  process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim()) ?? [];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  trustedOrigins,

  user: {
    additionalFields: {
      operatorId: {
        type: "number",
        required: true,
        input: false,
      },
    },
  },
});