import { existsSync, readFileSync } from "node:fs";
import * as dotenv from "dotenv";
import * as oracledbImport from "oracledb";

const oracledb = (oracledbImport as unknown as { default?: typeof import("oracledb") }).default
  ?? (oracledbImport as unknown as typeof import("oracledb"));

for (const envPath of [".env", "../../.env"]) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

async function main() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    const sqlPath = [
      "./database/TRAIN_INFO.sql",
      "./src/Scripts/database/TRAIN_INFO.sql",
    ].find(p => existsSync(p));

    if (!sqlPath) {
      throw new Error("TRAIN_INFO.sql not found. Run from server or src/Scripts.");
    }

    const sql = readFileSync(sqlPath, "utf8");

    const statements = sql
      .split(/;\r?\n/)
      .map(s => s.trim())
      .filter(s => s.startsWith("Insert into"));

    console.log(`Found ${statements.length} INSERT statements`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]!;
      await connection.execute(statement);

      if ((i + 1) % 500 === 0) {
        await connection.commit();
        console.log(`Inserted ${i + 1} rows`);
      }
    }

    await connection.commit();

    console.log("✅ TRAIN_INFO data imported successfully");
  } catch (err) {
    console.error(err);
  } finally {
    await connection?.close();
  }
}

main();