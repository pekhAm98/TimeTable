import { connectDB, closeDBPool } from "../config/db.js";
import { validateOperator } from "../services/operatorAuth.service.js";

await connectDB();

try {
  const result = await validateOperator(
    "ADMCRS",
    "ADMCRS2"
  );

  console.log("Operator validation:", result);
} finally {
  await closeDBPool();
}