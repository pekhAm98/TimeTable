import type { Request, Response } from "express";
import { generatePreview } from "../services/timetable.service.js";
import { connectDB, getConnection } from "../config/db.js";
import oracledb from "oracledb";
// POST   /preview
// POST   /
// GET    /
// GET    /:id
// POST   /:id/publish
// DELETE /:id

//user uploads--and get a preview of the timetable
export async function previewTimetable(req: Request, res: Response) {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "CSV file is required",
      });
    }

    const preview = await generatePreview(file, req.body);

    return res.status(200).json({
      success: true,
        data: preview,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Invalid CSV",
    });
  }
}

//HISTORY
export const getPreviews = async (req: Request, res: Response) => {
  try {
    // Fetch previews from the database or any other source
    const connection = await getConnection()
    const  result = await connection
    .execute(
  `SELECT
    upload_id,
    upload_name,
    line_id,
    run_day_type,
    created_by,
    created_at
FROM timetable_upload
ORDER BY created_at DESC;
  `,
  [],
  {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
  }
);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Failed to fetch previews",
    });
  }
};



//SAVE PREVIEW first time user saves the preview to the database
export const saveConfirmedPreview = async (
  req: Request,
  res: Response
) => {
  try {
    const body = req.body ?? {};
    const previewPayload = body.preview ?? body;
    const uploadName = body.uploadName ?? previewPayload.uploadName ?? body.upload_name ?? previewPayload.upload_name;
    const lineId = body.lineId ?? previewPayload.lineId ?? body.line_id ?? previewPayload.line_id;
    const runDayType = body.runDayType ?? previewPayload.runDayType ?? body.run_day_type ?? previewPayload.run_day_type;
    const rawTimetable = body.timetable ?? previewPayload.timetable ?? body.updatedPreview ?? previewPayload.updatedPreview;
    const timetable = typeof rawTimetable === "string" ? JSON.parse(rawTimetable) : rawTimetable ?? [];

    const preview = {
      uploadName,
      lineId: Number(lineId),
      runDayType: Number(runDayType),
      timetable: Array.isArray(timetable) ? timetable : [],
    };

    const connection = await getConnection();
    const result = await connection.execute(
      `
    INSERT INTO TIMETABLE_UPLOAD
    (
      UPLOAD_NAME,
      LINE_ID,
      RUN_DAY_TYPE,
      TIMETABLE_DATA,
      CREATED_BY
    )
    VALUES
    (
      :uploadName,
      :lineId,
      :runDayType,
      :timetableData,
      :createdBy
    )
    RETURNING UPLOAD_ID INTO :uploadId
    `,
      {
        uploadName: preview.uploadName,
        lineId: preview.lineId,
        runDayType: preview.runDayType,
        timetableData: JSON.stringify(preview),
        createdBy: "ADMIN",

        uploadId: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      }
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      uploadId: (result.outBinds as any).uploadId[0],
      message: "Preview saved successfully.",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to save preview",
    });
  }
};


//Get a specific preview by ID

export const getPreviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await getConnection();
    const result = await connection.execute(
      `
      SELECT
        upload_id,
        upload_name,
        line_id,
        run_day_type,
        timetable_data,
        created_by,
        created_at
      FROM timetable_upload
      WHERE upload_id = :id
      `,
      [id],
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    if (result.rows?.length === 0 || !result.rows) {
      return res.status(404).json({
        success: false,
        message: "Preview not found in DATABASE!",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Failed to fetch preview",
    });
  }
};

//patch a specific preview by ID
export const patchPreviewById = async (req: Request, res: Response) => {
  let connection;

  try {
    const { id } = req.params;
    const body = req.body ?? {};
    const previewPayload = body.preview ?? body;
    const uploadName = body.uploadName ?? previewPayload.uploadName;
    const lineId = body.lineId ?? previewPayload.lineId;
    const runDayType = body.runDayType ?? previewPayload.runDayType;
    const rawTimetable = body.timetable ?? previewPayload.timetable ?? body.updatedPreview ?? previewPayload.updatedPreview;
    const timetable = typeof rawTimetable === "string" ? JSON.parse(rawTimetable) : rawTimetable ?? [];
    const preview = {
      uploadName,
      lineId: Number(lineId),
      runDayType: Number(runDayType),
      timetable: Array.isArray(timetable) ? timetable : [],
    };

    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE TIMETABLE_UPLOAD
      SET
        UPLOAD_NAME = :uploadName,
        LINE_ID = :lineId,
        RUN_DAY_TYPE = :runDayType,
        TIMETABLE_DATA = :updatedPreview
      WHERE UPLOAD_ID = :id
      `,
      {
        uploadName: preview.uploadName,
        lineId: preview.lineId,
        runDayType: preview.runDayType,
        updatedPreview: JSON.stringify(preview),
        id: Number(id),
      }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Preview not found.",
      });
    }

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Preview updated successfully.",
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }

    return res.status(400).json({
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to update preview",
    });
  } finally {
    await connection?.close();
  }
};