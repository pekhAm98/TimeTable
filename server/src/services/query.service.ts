// import oracledb from "oracledb";
// import { getConnection } from "../config/db.js";
// import type { PreviewData } from ".";
// export async function savePreview(preview: PreviewData) {
//   const connection = await getConnection();

//   try {
//     const result = await connection.execute(
//       `
//       INSERT INTO TIMETABLE_UPLOAD
//       (
//         UPLOAD_NAME,
//         LINE_ID,
//         RUN_DAY_TYPE,
//         TIMETABLE_DATA,
//         CREATED_BY
//       )
//       VALUES
//       (
//         :uploadName,
//         :lineId,
//         :runDayType,
//         :timetableData,
//         :createdBy
//       )
//       RETURNING UPLOAD_ID INTO :uploadId
//       `,
//       {
//         uploadName: preview.uploadName,
//         lineId: preview.lineId,
//         runDayType: preview.runDayType,
//         timetableData: JSON.stringify(preview.timetable),
//         createdBy: "ADMIN", // replace with logged-in user later

//         uploadId: {
//           dir: oracledb.BIND_OUT,
//           type: oracledb.NUMBER,
//         },
//       }
//     );

//     await connection.commit();

//     return (result.outBinds as any).uploadId[0];
//   } finally {
//     await connection.close();
//   }
// }