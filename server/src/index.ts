import express from "express";
import { connectDB, getConnection } from "./config/db.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
dotenv.config();


const app = express();
const PORT = process.env.PORT || 8000;

await connectDB();
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
// Test the connection

app.use("/api/timetables", timetableRoutes);



app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
