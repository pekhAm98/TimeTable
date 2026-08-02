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

    await connection.execute(`
      BEGIN
        EXECUTE IMMEDIATE '
          CREATE TABLE TRAIN_INFO
          (
            TRAIN_ID VARCHAR2(20 BYTE),
            SOURCE_STATION VARCHAR2(60 BYTE) NOT NULL,
            DESTINATION_STATION VARCHAR2(60 BYTE) NOT NULL,
            DIRECTION NUMBER NOT NULL,
            START_TIME VARCHAR2(60 BYTE) NOT NULL,
            RUN_DAY_TYPE NUMBER NOT NULL,
            END_TIME VARCHAR2(60 BYTE) NOT NULL,
            LINE_ID NUMBER
          )
        ';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -955 THEN
            RAISE;
          END IF;
      END;
    `);

    await connection.execute(`
      BEGIN
        EXECUTE IMMEDIATE '
          ALTER TABLE TRAIN_INFO
          ADD CONSTRAINT TRAIN_INFO_PK
          PRIMARY KEY (TRAIN_ID, RUN_DAY_TYPE)
        ';
      EXCEPTION
        WHEN OTHERS THEN
          IF SQLCODE != -2261 THEN
            RAISE;
          END IF;
      END;
    `);

    console.log("✅ TRAIN_INFO table created.");
  } catch (err) {
    console.error(err);
  } finally {
    await connection?.close();
  }
}

main();