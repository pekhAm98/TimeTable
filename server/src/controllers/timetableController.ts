import { raw, type Request, type Response } from "express";
import { generatePreview } from "../services/timetable.service.js";
import { getConnection } from "../config/db.js";
import oracledb from "oracledb";
import { transformAndValidateTimetable, type PreviewData } from "../services/transformTimetable.js";
import { normalizeTimeToHmsOrThrow } from "../utils/timeFormat.js";


async function resolveOracleValue(value: unknown): Promise<unknown> {
  if (value && typeof value === "object" && "getData" in value && typeof (value as { getData?: unknown }).getData === "function") {
    return await (value as { getData: () => Promise<unknown> }).getData();
  }

  return value;
}

function toValidRunDayType(value: unknown): number {
  const numeric = Number(value);

  if ([1, 2, 4].includes(numeric)) {
    return numeric;
  }

  const text = String(value ?? "").trim().toUpperCase();

  if (text === "WEEKDAY") return 1;
  if (text === "SATURDAY") return 2;
  if (text === "SUNDAY") return 4;

  return 0;
}

function toPositiveNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function normalizeTimetableRows(raw: unknown): PreviewData["timetable"] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item, index) => {
    const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};

    return {
      trainId: String(row.trainId ?? row.TRAIN_ID ?? row.train_id ?? "").trim(),
      sourceStation: String(row.sourceStation ?? row.SOURCE_STATION ?? row.source_station ?? "").trim(),
      destinationStation: String(row.destinationStation ?? row.DESTINATION_STATION ?? row.destination_station ?? "").trim(),
      direction: Number(row.direction ?? row.DIRECTION ?? 0),
      startTime: normalizeTimeToHmsOrThrow(row.startTime ?? row.START_TIME ?? row.start_time ?? "", "START TIME", index + 1),
      endTime: normalizeTimeToHmsOrThrow(row.endTime ?? row.END_TIME ?? row.end_time ?? "", "END TIME", index + 1),
    };
  });
}
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
  let connection;

  try {
    // Fetch previews from the database or any other source
    connection = await getConnection()
    const  result = await connection
    .execute(
  `SELECT
    upload_id,
    upload_name,
    line_id,
    run_day_type,
    created_by,
    created_at,
    status
FROM timetable_upload
WHERE IS_DELETED = 0
ORDER BY created_at DESC
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
  } finally {
    await connection?.close();
  }
};



//SAVE PREVIEW first time user saves the preview to the database---MODIFIED
export const saveConfirmedPreview = async (
  req: Request,
  res: Response
) => {
  let connection;

  try {
    const user = req.user;
    //const user = req.session?.userId ?? {};
    const body = req.body ?? {};
    const previewPayload = body.preview ?? body;
    const uploadName = body.uploadName ?? previewPayload.uploadName ?? body.upload_name ?? previewPayload.upload_name;
    const lineId = body.lineId ?? previewPayload.lineId ?? body.line_id ?? previewPayload.line_id;
    const runDayType = body.runDayType ?? previewPayload.runDayType ?? body.run_day_type ?? previewPayload.run_day_type;
    const rawTimetable = body.timetable ?? previewPayload.timetable ?? body.updatedPreview ?? previewPayload.updatedPreview;
    const timetable = typeof rawTimetable === "string" ? JSON.parse(rawTimetable) : rawTimetable ?? [];

    if(!user ) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User information is missing.",
      });
    }
    const createdBy = String(user.name+'-'+user.id).trim();


    const preview = {
      uploadName,
      lineId: Number(lineId),
      runDayType: Number(runDayType),
      timetable: normalizeTimetableRows(timetable),
    };

    connection = await getConnection();
    const result = await connection.execute(
      `
    INSERT INTO TIMETABLE_UPLOAD
(
    UPLOAD_NAME,
    LINE_ID,
    RUN_DAY_TYPE,
    TIMETABLE_DATA,
    STATUS,
    CREATED_BY,
    CREATED_AT,
    MODIFIED_BY,
    MODIFIED_AT,
    PUBLISHED_BY,
    PUBLISHED_AT,
    IS_DELETED,
    DELETED_BY,
    DELETED_AT
)
VALUES
(
    :uploadName,
    :lineId,
    :runDayType,
    :timetableData,
    'UPLOADED',
    :createdBy,
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    NULL,
    NULL
)
    `,
      {
        uploadName: preview.uploadName,
        lineId: preview.lineId,
        runDayType: preview.runDayType,
        timetableData: JSON.stringify(preview),
        createdBy: createdBy,

        uploadId: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      }
    );

    await connection.execute(
      `
      INSERT INTO TIMETABLE_ACTION_LOGS
      (
        UPLOAD_ID,
        ACTION_TYPE,
        ACTION_BY,
        ACTION_AT,
        REMARKS
      )
      VALUES
      (
        :uploadId,
        'CREATE',
        :actionBy,
        CURRENT_TIMESTAMP,
        :remarks
      )
      `,
      {
        uploadId: (result.outBinds as any).uploadId[0],
        actionBy: createdBy,
        remarks: 'Initial creation',
      }
    );


    await connection.commit();

    return res.status(201).json({
      success: true,
      uploadId: (result.outBinds as any).uploadId[0],
      message: "Preview saved successfully.",
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
          : "Failed to save preview",
    });
  } finally {
    await connection?.close();
  }
};


//Get a specific preview by ID---MODIFIED

export const getPreviewById = async (req: Request, res: Response) => {
  let connection;

  try {
    const { id } = req.params;
    console.log("getPreviewById -> requested id:", id);

    connection = await getConnection();
    const result = await connection.execute(
      `
      SELECT
        upload_id,
        upload_name,
        line_id,
        run_day_type,
        timetable_data,
        created_by,
        created_at,
        status
      FROM timetable_upload
      WHERE upload_id = :id
      AND IS_DELETED = 0
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

    const row = result.rows[0] as Record<string, unknown>;
    const previewId = Number(row.upload_id ?? row.UPLOAD_ID ?? id);
    const uploadName = String(row.upload_name ?? row.UPLOAD_NAME ?? "");
    const lineId = Number(row.line_id ?? row.LINE_ID ?? 0);
    const runDayType = Number(row.run_day_type ?? row.RUN_DAY_TYPE ?? 0);
    const timetableData = await resolveOracleValue(row.timetable_data ?? row.TIMETABLE_DATA ?? "[]");
    const timetableString = typeof timetableData === "string" ? timetableData : JSON.stringify(timetableData ?? []);
    const parsedTimetable = (() => {
      try {
        const parsed = JSON.parse(timetableString);
        return Array.isArray(parsed?.timetable) ? parsed.timetable : Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();
    const normalizedTimetable = normalizeTimetableRows(parsedTimetable);

    console.log("getPreviewById -> fetched row:", {
      previewId,
      uploadName,
      lineId,
      runDayType,
    });

    return res.status(200).json({
      success: true,
      data: {
        previewId,
        uploadName,
        lineId,
        runDayType,
        timetable: normalizedTimetable,
        created_by: String(row.created_by ?? row.CREATED_BY ?? ""),
        created_at: String(row.created_at ?? row.CREATED_AT ?? ""),
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Failed to fetch preview",
    });
  } finally {
    await connection?.close();
  }
};




//patch a specific preview by ID --MODIFIED
export const patchPreviewById = async (req: Request, res: Response) => {
  let connection;

  try {
    const { id } = req.params;
    const user = req.user;
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
      timetable: normalizeTimetableRows(timetable),
    };
    if (!user) {
  return res.status(401).json({
    success: false,
    message: "Unauthorized",
  });
}
    connection = await getConnection();

    const result = await connection.execute(
      `
      UPDATE TIMETABLE_UPLOAD
      SET
        UPLOAD_NAME = :uploadName,
        LINE_ID = :lineId,
        RUN_DAY_TYPE = :runDayType,
        TIMETABLE_DATA = :updatedPreview,
        STATUS = :status,
        MODIFIED_BY = :modifiedBy,
        MODIFIED_AT = CURRENT_TIMESTAMP
      WHERE UPLOAD_ID = :id
      AND IS_DELETED = 0
      `,
      {
        uploadName: preview.uploadName,
        lineId: preview.lineId,
        runDayType: preview.runDayType,
        updatedPreview: JSON.stringify(preview),
        status: "MODIFIED",
        modifiedBy: (user.name + "-" + user.id).trim()  ,
        id: Number(id),
      }
    );

    

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Preview not found.",
      });
    }
    await connection.execute(
      `
      INSERT INTO TIMETABLE_ACTION_LOGS (
        UPLOAD_ID,
        ACTION_TYPE,
        ACTION_BY,
        ACTION_AT,
        REMARKS
      ) VALUES (
        :uploadId,
        :actionType,
        :actionBy,
        CURRENT_TIMESTAMP,
        :remarks
      )
      `,
      {
        uploadId: Number(id),
        actionType: "MODIFY",
        actionBy: user?.id ?? "unknown",
        remarks: "Modified preview",
      }
    );

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


//DELETE a specific preview by ID --MODIFIED
export const deletePreviewById = async (req: Request, res: Response) => {
  let connection = null;
  
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    connection = await getConnection();

    // First check existing record
    const existing = await connection.execute(
      `
      SELECT 
        STATUS,
        IS_DELETED
      FROM TIMETABLE_UPLOAD
      WHERE UPLOAD_ID = :id
      `,
      {
        id: Number(id),
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

if (!existing.rows || existing.rows.length === 0) {
  return res.status(404).json({
    success: false,
    message: "Timetable upload does not exist.",
  });
}

    const upload = existing.rows[0] as {
      STATUS: string;
      IS_DELETED: number;
    };

    if (upload.IS_DELETED === 1) {
      return res.status(400).json({
        success: false,
        message: "Timetable upload is already deleted.",
      });
    }

    if (upload.STATUS === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Published timetable cannot be deleted.",
      });
    }


    // Perform soft delete
    await connection.execute(
      `
      UPDATE TIMETABLE_UPLOAD
      SET 
          IS_DELETED = 1,
          DELETED_BY = :deletedBy,
          DELETED_AT = CURRENT_TIMESTAMP
      WHERE UPLOAD_ID = :id
      `,
      {
        deletedBy: (user.name + "-" + user.id).trim(),
        id: Number(id),
      }
    );


    // Add audit log
    await connection.execute(
      `
      INSERT INTO TIMETABLE_ACTION_LOGS
      (
        UPLOAD_ID,
        ACTION_TYPE,
        ACTION_BY,
        REMARKS
      )
      VALUES
      (
        :uploadId,
        'DELETE',
        :actionBy,
        :remarks
      )
      `,
      {
        uploadId: Number(id),
        actionBy: (user.name + "-" + user.id).trim(),
        remarks: "Timetable deleted",
      }
    );


    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Timetable deleted successfully.",
    });

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }

    return res.status(500).json({
      success: false,
      message:
        err instanceof Error
          ? err.message
          : "Failed to delete timetable",
    });

  } finally {
    await connection?.close();
  }
};


//PUBLISH a specific preview by ID 
export const publishPreview = async (req: Request, res: Response) => {
  type PublishPreviewRow = {
    LINE_ID?: number;
    line_id?: number;
    RUN_DAY_TYPE?: number;
    RUN_DAY?: unknown;
    run_day_type?: number;
    run_day?: unknown;
    TIMETABLE_DATA?: unknown;
    timetable_data?: unknown;
    status?: string;
    STATUS?: string;
  };

  const paramId = req.params?.id;
  const bodyId = req.body?.previewId;
  const id = String(paramId ?? bodyId ?? "");
  console.log("publishPreview -> incoming id:", id);

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Preview ID is required to publish. save first before publishing.",
    });
  }

  const previewId = Number(id);

  if (!Number.isFinite(previewId) || previewId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid preview ID. Must be a positive number.",
    });
  }
  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. User information is missing.",
    });
  }
  let connection;

  try {
    connection = await getConnection();
    
    const timeTable = await connection.execute<PublishPreviewRow>(
      `SELECT LINE_ID,RUN_DAY_TYPE,TIMETABLE_DATA,STATUS FROM timetable_upload WHERE upload_id = :id and IS_DELETED = 0`,
      [previewId],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!timeTable.rows || timeTable.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Preview not found. Cannot publish.",
      });
    }

    //HANDLE ALEREADY PUBLISHED PREVIEW
  
    const firstRow = timeTable.rows[0];
    if((firstRow?.STATUS ?? "").toUpperCase() === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Preview is already published. Cannot publish.",
      });
    }


    const lineIdFromRow = toPositiveNumber(firstRow?.LINE_ID ?? firstRow?.line_id ?? 0);
    const runDayTypeFromRow = toValidRunDayType(firstRow?.RUN_DAY_TYPE ?? firstRow?.run_day_type ?? firstRow?.RUN_DAY ?? firstRow?.run_day);
    const rawTimetableData = await resolveOracleValue(firstRow?.TIMETABLE_DATA ?? firstRow?.timetable_data ?? "[]");
    const timetableString = typeof rawTimetableData === "string" ? rawTimetableData : JSON.stringify(rawTimetableData ?? []);
    const parsedTimetableData = JSON.parse(timetableString);

    const parsedObject = parsedTimetableData && typeof parsedTimetableData === "object"
      ? (parsedTimetableData as Record<string, unknown>)
      : {};

    const lineIdFromPayload = toPositiveNumber(parsedObject.lineId ?? parsedObject.LINE_ID ?? parsedObject.line_id);
    const runDayTypeFromPayload = toValidRunDayType(
      parsedObject.runDayType ?? parsedObject.RUN_DAY_TYPE ?? parsedObject.run_day_type ?? parsedObject.runDay ?? parsedObject.RUN_DAY
    );
    const lineId = lineIdFromRow || lineIdFromPayload;
    const runDayType = runDayTypeFromRow || runDayTypeFromPayload;

    const rawRows = Array.isArray(parsedTimetableData)
      ? parsedTimetableData
      : parsedObject.timetable ?? parsedObject.TIMETABLE;

    const previewToValidate: PreviewData = {
      uploadName: String(parsedObject.uploadName ?? parsedObject.UPLOAD_NAME ?? "").trim(),
      lineId,
      runDayType,
      timetable: normalizeTimetableRows(rawRows),
    };

    const { transformed: verifiedTimetable, errors } = transformAndValidateTimetable(previewToValidate);

    

    if (errors && errors.length > 0) {
      console.warn("publishPreview -> validation failed", { previewId, errorsCount: errors.length, errors });
      return res.status(400).json({
        success: false,
        message: "Preview contains validation errors. Cannot publish.",
        errors,
      });
    }
    ///////VERIFIED TIMETABLE IS READY TO BE PUBLISHED

    ///REMOVE THE PREVIOUSLY PUBLISHED TIMETABLE FOR THE SAME LINE_ID AND RUN_DAY_TYPE


    await connection.execute(
      `
      UPDATE TIMETABLE_UPLOAD
      SET STATUS = 'MODIFIED',
          MODIFIED_BY = :modifiedBy,
          MODIFIED_AT = CURRENT_TIMESTAMP
      WHERE LINE_ID = :lineId
      AND RUN_DAY_TYPE = :runDayType
      AND UPLOAD_ID != :previewId
      AND STATUS = 'PUBLISHED'
      AND IS_DELETED = 0
      `,
      {
        modifiedBy: user.name + "-" + user.id,
        lineId,
        runDayType,
        previewId,
      }
    );

    const publishResult = await connection.execute(
      `
      UPDATE TIMETABLE_UPLOAD
      SET STATUS = 'PUBLISHED',
          PUBLISHED_BY = :publishedBy,
          PUBLISHED_AT = CURRENT_TIMESTAMP
      WHERE UPLOAD_ID = :previewId
      AND IS_DELETED = 0
      `,
      {
        publishedBy: user.name + "-" + user.id,
        previewId,
      }
    );

     if (publishResult.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Preview not found or already deleted. Cannot publish.",
      });
    } 


    //PUBLISHING THE TIMETABLE TO TRAIN_INFO TABLE
    await connection.execute(
      `
      DELETE FROM TRAIN_INFO
      WHERE LINE_ID = :lineId
      AND RUN_DAY_TYPE = :runDayType
      `,
      {
        lineId,
        runDayType,
      }
    );

    for (const row of verifiedTimetable.timetable) {

      await connection.execute(
        `
        INSERT INTO TRAIN_INFO
        (
          TRAIN_ID,
          SOURCE_STATION,
          DESTINATION_STATION,
          DIRECTION,
          START_TIME,
          END_TIME,
          LINE_ID,
          RUN_DAY_TYPE
        )
        VALUES
        (
          :trainId,
          :sourceStation,
          :destinationStation,
          :direction,
          :startTime,
          :endTime,
          :lineId,
          :runDayType
        )
        `,
        {
          trainId: row.trainId,
          sourceStation: row.sourceStation,
          destinationStation: row.destinationStation,
          direction: row.direction,
          startTime: row.startTime,
          endTime: row.endTime,
          lineId,
          runDayType,
        }
      );
    }
    //INCREMENT THE VERSION NUMBER IN VERSION_PARAMETER TABLE FOR THE SPECIFIC LINE_ID
    await connection.execute(
      `
      UPDATE VERSION_PARAMETER
      SET 
        CURRENT_VERSION = CURRENT_VERSION + 1,
        LAST_MODIFIED = CURRENT_TIMESTAMP
      WHERE TABLE_ID = 4
      AND LINE_ID = :lineId
      `,
      {
        lineId,
      }
    );

    //LOG THE PUBLISH ACTION IN TIMETABLE_ACTION_LOGS
    await connection.execute(
      `INSERT INTO TIMETABLE_ACTION_LOGS
      (
        UPLOAD_ID,
        ACTION_TYPE,
        ACTION_BY,
        ACTION_AT,
        REMARKS
      )
      VALUES
      (
        :uploadId,
        :actionType,
        :actionBy,
        CURRENT_TIMESTAMP,
        :remarks
      )
      `,
      {
        uploadId: previewId,
        actionType: "PUBLISH",
        actionBy: user.name + "-" + user.id,
        remarks: "Published timetable",
      }
    );




    await connection.commit();
    console.log("publishPreview -> published", {
      previewId,
      lineId,
      runDayType,
      rows: verifiedTimetable.timetable.length,
    });

    return res.status(200).json({
      success: true,
      message: "Preview published successfully.",
      data: {
        previewId,
        lineId,
        runDayType,
        timetable: verifiedTimetable.timetable,
        errors,
      },
    });
  } catch (err) {
    console.error("publishPreview -> failed", { id, err });
    if (connection) {
      await connection.rollback();
    }
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Failed to fetch preview for publishing",
    });
  } finally {
    await connection?.close();
  }
};
