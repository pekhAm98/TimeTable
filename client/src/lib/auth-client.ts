import { createAuthClient } from "better-auth/react";

console.log("AUTH API URL:", process.env.NEXT_PUBLIC_API_URL);

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  fetchOptions: {
    credentials: "include",
  },
});