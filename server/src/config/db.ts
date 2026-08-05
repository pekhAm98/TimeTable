import dotenv from "dotenv";
dotenv.config();
import oracledb from "oracledb";




export async function connectDB() {
  try {

    //DEBUG:
    console.log("Oracle config:", {
      user: process.env.ORACLE_USER,
      connectString: process.env.ORACLE_CONNECTION_STRING,
    });



    await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
      poolAlias: "metro",
    });

    console.log("✅ Oracle connected");
  } catch (err) {
    console.error("❌ Oracle connection failed");
    console.error(err);
    process.exit(1);
  }
}

export async function closeDBPool() {
  try {
    const pool = oracledb.getPool("metro");
    await pool.close(10);
    console.log("✅ Oracle pool closed");
  } catch (err) {
    // NJS-047 means no active pool exists for the alias.
    if (err instanceof Error && err.message.includes("NJS-047")) {
      return;
    }

    console.error("❌ Failed to close Oracle pool");
    console.error(err);
  }
}

export function getConnection() {
  return oracledb.getConnection("metro");
}