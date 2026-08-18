import {
  getSybaseConnection,
  reconnectSybase,
} from "../config/db.js";


export interface ValidatedOperator {
  operatorId: number;
  operatorCode: string;
  operatorName: string;
}

function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}


function executeSybaseQuery<T>(
  db: ReturnType<typeof getSybaseConnection>,
  sql: string
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      resolve((data ?? []) as T[]);
    });
  });
}

function isClosedSybaseConnection(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("JZ0C0") ||
    error.message.toLowerCase().includes(
      "connection is already closed"
    )
  );
}

export async function querySybase<T = unknown>(
  sql: string
): Promise<T[]> {

  // First attempt
  try {
    const db = getSybaseConnection();

    return await executeSybaseQuery<T>(db, sql);

  } catch (error) {

    // Only reconnect for a dead connection.
    if (!isClosedSybaseConnection(error)) {
      throw error;
    }

    console.warn(
      "⚠️ Sybase connection is closed. Reconnecting..."
    );

    // Reconnect
    const db = await reconnectSybase();

    // Retry ONCE
    console.log("🔁 Retrying Sybase query...");

    return await executeSybaseQuery<T>(db, sql);
  }
}
export async function validateOperator(
  operatorCode: string,
  password: string
): Promise<ValidatedOperator | null> {
  const code = operatorCode.trim().toUpperCase();

  if (!code || !password) {
    return null;
  }

  /*
   * Step 1:
   * Find the operator and check whether they are allowed
   * to use this application.
   *
   * Password is NOT selected here.
   */
  const safeCode = escapeSqlString(code);

  const operators = await querySybase<{
    OPERATOR_ID: number;
    OPERATOR_CODE: string;
    OPERATOR_NAME: string;
  }>(`
    SELECT
      OPERATOR_ID,
      OPERATOR_CODE,
      OPERATOR_NAME
    FROM OPERATOR
    WHERE OPERATOR_CODE = '${safeCode}'
      AND (
        (
          LOCATION_ID = 2001
          AND OPERATOR_TYPE_ID = 'S'
          AND OPERATOR_STATUS = 1
        )
        OR OPERATOR_CODE = 'ADMCRS'
      )
  `);

  if (operators.length === 0) {
    return null;
  }

  const operator = operators[0];
  if (!operator) {
  return null;
}

  /*
   * Step 2:
   * Let Sybase's existing procedure validate the password.
   */
  const safePassword = escapeSqlString(password);

  const validation = await querySybase<{
    valid_flag: number;
  }>(`
    DECLARE @valid_flag TINYINT

    EXEC mts_int_vld_passwd
      '${safeCode}',
      2001,
      '${safePassword}',
      @valid_flag OUT

    SELECT @valid_flag AS valid_flag
  `);

  if (validation.length === 0) {
    return null;
  }

  if (Number(validation?.[0]?.valid_flag??0) !== 1) {
    return null;
  }

  return {
    operatorId: Number(operator.OPERATOR_ID),
    operatorCode: String(operator.OPERATOR_CODE).trim(),
    operatorName: String(operator.OPERATOR_NAME).trim(),
  };
}