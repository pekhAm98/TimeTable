import { loadEnv } from "./loadEnv.js";
loadEnv();

import oracledb from "oracledb";
import Sybase from "sybase";

let sybaseDB: Sybase | null = null;

export async function connectDB() {
  try {
    // =========================
    // ORACLE
    // =========================

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

    // =========================
    // SYBASE
    // =========================

    sybaseDB = new Sybase(
      process.env.SYBASE_HOST!,
      Number(process.env.SYBASE_PORT!),
      process.env.SYBASE_DATABASE!,
      process.env.SYBASE_USER!,
      process.env.SYBASE_PASSWORD!
    );

    await new Promise<void>((resolve, reject) => {
      sybaseDB!.connect((err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });

    console.log("✅ Sybase connected");

    // Test query
//     await new Promise<void>((resolve, reject) => {
//       sybaseDB!.query(
//   `
//     SELECT TOP 5
//       OPERATOR_ID,
//       OPERATOR_CODE,
//       OPERATOR_NAME,
//       LOCATION_ID,
//       OPERATOR_STATUS,
//       OPERATOR_TYPE_ID
//     FROM OPERATOR
//   `,
//   (err, data) => {
//     if (err) {
//       reject(err);
//       return;
//     }

//     console.log("✅ Operator query:", data);
//     resolve();
//   }
// );
//     });

  } catch (err) {
    console.error("❌ Database connection failed");
    console.error(err);
    process.exit(1);
  }
}

export async function closeDBPool() {
  try {
    // Close Oracle
    try {
      const pool = oracledb.getPool("metro");
      await pool.close(10);
      console.log("✅ Oracle pool closed");
    } catch (err) {
      if (!(err instanceof Error && err.message.includes("NJS-047"))) {
        console.error("❌ Failed to close Oracle pool");
        console.error(err);
      }
    }

    // Close Sybase
    if (sybaseDB) {
      sybaseDB.disconnect();
      sybaseDB = null;
      console.log("✅ Sybase connection closed");
    }

  } catch (err) {
    console.error("❌ Failed to close database connections");
    console.error(err);
  }
}

export function getConnection() {
  return oracledb.getConnection("metro");
}

export function getSybaseConnection() {
  if (!sybaseDB) {
    throw new Error("Sybase connection is not initialized");
  }

  return sybaseDB;
}