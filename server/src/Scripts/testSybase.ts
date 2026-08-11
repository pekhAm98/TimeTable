import sybase from "sybase";
import dotenv from "dotenv";

dotenv.config();

const db = {
  host: process.env.SYBASE_HOST!,
  port: Number(process.env.SYBASE_PORT),
  database: process.env.SYBASE_DATABASE!,
  username: process.env.SYBASE_USER!,
  password: process.env.SYBASE_PASSWORD!,
};

async function main() {
  try {
    console.log("Connecting to Sybase...");

    const connection = await sybase(db);

    console.log("Connected to Sybase!");

    const result = await connection.query("SELECT 1 AS test");

    console.log("Query result:", result);

    await connection.close();

    console.log("Connection closed.");
  } catch (error) {
    console.error("Sybase connection failed:");
    console.error(error);
  }
}

main();