import dotenv from "dotenv";
dotenv.config();
import oracledb from "oracledb";




export async function connectDB() {
  try {
    await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
      poolAlias: "metro",
    });

    console.log("✅ Oracle connected");
  } catch (err) {
    console.error("❌ Oracle connection failed");
    console.error(err);
    process.exit(1);
  }
}

export function getConnection() {
  return oracledb.getConnection("metro");
}