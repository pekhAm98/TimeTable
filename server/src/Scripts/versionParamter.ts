import "dotenv/config";
import oracledb from "oracledb";

async function main() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    // Create table
    await connection.execute(`
      BEGIN
        EXECUTE IMMEDIATE '
          CREATE TABLE VERSION_PARAMETER (
            TABLE_ID        NUMBER NOT NULL,
            TABLE_NAME      VARCHAR2(60 BYTE),
            CURRENT_VERSION NUMBER,
            LINE_ID         NUMBER DEFAULT 0 NOT NULL,
            LAST_MODIFIED   TIMESTAMP,

            CONSTRAINT VERSION_PARAMETER_PK
              PRIMARY KEY (TABLE_ID, LINE_ID)
          )
        ';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -955 THEN
            RAISE;
          END IF;
      END;
    `);

    // Seed only TRAIN_INFO rows
    const rows = [
      { lineId: 1, version: 6399 },
      { lineId: 2, version: 6389 },
      { lineId: 3, version: 276 },
      { lineId: 4, version: 140 },
      { lineId: 6, version: 273 },
    ];

    for (const row of rows) {
      await connection.execute(
        `
        MERGE INTO VERSION_PARAMETER vp
        USING (
          SELECT
            :tableId table_id,
            :lineId line_id
          FROM dual
        ) src
        ON (
          vp.TABLE_ID = src.table_id
          AND vp.LINE_ID = src.line_id
        )
        WHEN NOT MATCHED THEN
          INSERT (
            TABLE_ID,
            TABLE_NAME,
            CURRENT_VERSION,
            LINE_ID,
            LAST_MODIFIED
          )
          VALUES (
            :tableId,
            :tableName,
            :currentVersion,
            :lineId,
            CURRENT_TIMESTAMP
          )
        `,
        {
          tableId: 4,
          tableName: "TRAIN_INFO",
          currentVersion: row.version,
          lineId: row.lineId,
        }
      );
    }

    await connection.commit();

    console.log("✅ VERSION_PARAMETER ready.");
  } catch (err) {
    console.error(err);
  } finally {
    await connection?.close();
  }
}

main();