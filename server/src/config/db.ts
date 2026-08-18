import { loadEnv } from "./loadEnv.js";
loadEnv();

import oracledb from "oracledb";
import Sybase from "sybase";

let sybaseDB: Sybase | null = null;

// Prevent multiple requests from reconnecting simultaneously.
let sybaseReconnectPromise: Promise<Sybase> | null = null;

async function createSybaseConnection(): Promise<Sybase> {
  const db = new Sybase(
    process.env.SYBASE_HOST!,
    Number(process.env.SYBASE_PORT!),
    process.env.SYBASE_DATABASE!,
    process.env.SYBASE_USER!,
    process.env.SYBASE_PASSWORD!
  );

  await new Promise<void>((resolve, reject) => {
    db.connect((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  return db;
}

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

    sybaseDB = await createSybaseConnection();

    console.log("✅ Sybase connected");
  } catch (err) {
    console.error("❌ Database connection failed");
    console.error(err);
    process.exit(1);
  }
}

export async function reconnectSybase(): Promise<Sybase> {
  // If another request is already reconnecting,
  // wait for that same reconnect operation.
  if (sybaseReconnectPromise) {
    console.log("⏳ Sybase reconnect already in progress...");
    return sybaseReconnectPromise;
  }

  sybaseReconnectPromise = (async () => {
    console.log("🔄 Reconnecting to Sybase...");

    // Dispose of the old connection object.
    if (sybaseDB) {
      try {
        sybaseDB.disconnect();
      } catch (err) {
        console.warn(
          "⚠️ Old Sybase connection was already closed."
        );
      }

      sybaseDB = null;
    }

    // Create a completely new connection.
    const newConnection = await createSybaseConnection();

    sybaseDB = newConnection;

    console.log("✅ Sybase reconnected");

    return newConnection;
  })();

  try {
    return await sybaseReconnectPromise;
  } finally {
    // Allow another reconnect in the future if necessary.
    sybaseReconnectPromise = null;
  }
}

export async function closeDBPool() {
  try {
    // =========================
    // ORACLE
    // =========================

    try {
      const pool = oracledb.getPool("metro");

      await pool.close(10);

      console.log("✅ Oracle pool closed");
    } catch (err) {
      if (
        !(
          err instanceof Error &&
          err.message.includes("NJS-047")
        )
      ) {
        console.error("❌ Failed to close Oracle pool");
        console.error(err);
      }
    }

    // =========================
    // SYBASE
    // =========================

    if (sybaseDB) {
      try {
        sybaseDB.disconnect();
      } catch {
        // Ignore already-closed connection.
      }

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

export function getSybaseConnection(): Sybase {
  if (!sybaseDB) {
    throw new Error(
      "Sybase connection is not initialized"
    );
  }

  return sybaseDB;
}