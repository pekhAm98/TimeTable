
import { auth } from "../auth/auth.js";
import { fromNodeHeaders } from "better-auth/node";

const token = "vQIIcjp0Lpgc4tIOD5v7HW7JEhCMaBbV";

const result = await auth.api.getSession({
  headers: fromNodeHeaders({
    cookie: `better-auth.session_token=${token}`,
  }),
});

console.log("DIRECT SESSION RESULT:", result);