import express from "express";
import { closeDBPool, connectDB } from "./config/db.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import cors from "cors";
import morgan from "morgan";
import { loadEnv } from "./config/loadEnv.js";
loadEnv();
import { auth } from "./auth/auth.js";
import { toNodeHandler } from "better-auth/node";
import {requireAuth} from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 8000;

await connectDB();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(morgan("dev"));


app.all("/api/auth/*splat", toNodeHandler(auth));

// Test the connection

app.use("/api/timetables", requireAuth, timetableRoutes);



const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

let shuttingDown = false;

async function gracefulShutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}. Shutting down gracefully...`);

  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

  await closeDBPool();
  process.exit(0);
}

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});
