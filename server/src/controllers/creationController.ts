import { type Request, type Response } from "express";
import allLines from "../constants/allLines.js";
import { getConnection } from "../config/db.js";
import oracledb from "oracledb";
import { error } from "node:console";

const getAllLines = (req: Request, res: Response) => {
  return res.status(200).json(allLines);
};

const getLineStations = async (req: Request, res: Response) => {
  let connection: oracledb.Connection | undefined;
  try {
    const { lineId } = req.params;
    const { direction } = req.query;
    connection = await getConnection();
    if (typeof lineId !== "string") {
      res.status(400).json({
        message: "lineId must be a string",
      });
      return;
    }

    if (typeof direction !== "string") {
      res.status(400).json({
        message: "direction must be a string",
      });
      return;
    }

    const normalizedDirection = direction.toLowerCase();

    if (!["up", "down"].includes(normalizedDirection)) {
      res.status(400).json({
        message: "direction must be either 'up' or 'down'",
      });
      return;
    }

    const directionOrder = normalizedDirection === "down" ? "ASC" : "DESC";

    const sql: string = `
        SELECT STATION_CODE, STATION_ID
        FROM TIMETABLE_LINE_STATION_SEQUENCE
        WHERE LINE_ID = :lineId
        ORDER BY SEQUENCE_NO ${directionOrder}
      `;

    const result = await connection.execute(
      sql,
      {
        lineId,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch line stations",
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error(error);
      }
    }
  }
};

const getServicePatterns = async (req: Request, res: Response) => {
  const { lineId } = req.params;
  const { direction } = req.query;
  if (!direction || (direction.toString().toUpperCase() !== "DOWN" && direction.toString().toUpperCase() !== "UP")) {
    res.status(400).json({
      message: "Invalid direction",
    });
    return;
  }
  const query = `SELECT * FROM TIMETABLE_SERVICE_PATTERN WHERE LINE_ID = :lineId AND DIRECTION = :direction`;
  let connection: oracledb.Connection | undefined;
  try {
    connection = await getConnection();
    const result = await connection.execute(query, [lineId, direction.toString().toUpperCase()], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: {
        TRAVEL_TIMES: {
          type: oracledb.STRING,
        },
      },
    });
    const rows = result.rows?.map((row: any) => ({ ...row, TRAVEL_TIMES: JSON.parse(row.TRAVEL_TIMES) }));
    if (!rows) {
      res.status(404).json({
        message: "Service patterns not found for the given line and direction",
      });
      return;
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ getServicePatterns error:", error);
    res.status(500).json({
      message: "Failed to fetch service patterns",
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error(error);
      }
    }
  }
};

const createServicePatterns = async (req: Request, res: Response) => {
  const { lineId } = req.params;
  const { direction, serviceName, TRAVEL_TIMES } = req.body;
  let connection: oracledb.Connection | undefined;
  if (!lineId || !direction || !serviceName) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }
  //direction check
  if (direction.toString().toUpperCase() !== "DOWN" && direction.toString().toUpperCase() !== "UP") {
    res.status(400).json({ message: "Invalid direction" });
    return;
  }
  //line id check
  const line = allLines.find((line) => line.id === Number(lineId));
  if (!line) {
    res.status(400).json({ message: "Line not found" });
    return;
  }

  //CHECKING THE TRAVEL TIMES LENGTH
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `
    SELECT COUNT(*) AS STATION_COUNT
    FROM TIMETABLE_LINE_STATION_SEQUENCE
    WHERE LINE_ID = :lineId
  `,
      { lineId: Number(lineId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const count = (result.rows?.[0] as any)?.STATION_COUNT;

    console.log("count:", count);
    if (!count || count === 0) {
      res.status(404).json({ message: "Line Stations not found" });
      return;
    }
    if (!Array.isArray(TRAVEL_TIMES) || TRAVEL_TIMES.length !== count - 1) {
      res.status(400).json({
        message: "Invalid travel times arry length",
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch line stations", error: error instanceof Error ? error.message : String(error) });
    return;
  }

  const query = `INSERT INTO TIMETABLE_SERVICE_PATTERN (LINE_ID, DIRECTION, PATTERN_NAME , TRAVEL_TIMES) VALUES (:lineId, :direction, :serviceName, :travelTimes)`;

  try {
    if (!connection) {
      connection = await getConnection();
    }
    await connection.execute(query, [lineId, direction.toString().toUpperCase(), serviceName, JSON.stringify(TRAVEL_TIMES)]);
    await connection.commit(); // Commit the transaction
    console.log;
    res.status(201).json({ message: "Service pattern created successfully" });
  } catch (error) {
    console.error("❌ createServicePatterns error:", error);
    res.status(500).json({
      message: "Failed to create service patterns",
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error(error);
      }
    }
  }
};

const updateServicePatterns = async (req: Request, res: Response) => {
  const { lineId } = req.params;
  const { direction, serviceNameOld, serviceNameNew, TRAVEL_TIMES } = req.body;

  let connection: oracledb.Connection | undefined;

  try {
    connection = await getConnection();

    // Find existing pattern
    const query = `
      SELECT PATTERN_ID
      FROM TIMETABLE_SERVICE_PATTERN
      WHERE LINE_ID = :lineId
        AND DIRECTION = :direction
        AND PATTERN_NAME = :serviceNameOld
    `;

    const result = await connection.execute(query, [lineId, direction, serviceNameOld], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        message: "Service pattern not found",
        success: false,
        data: null,
      });
    }

    if (result.rows.length !== 1) {
      return res.status(400).json({
        message: "Multiple service patterns found",
        success: false,
        data: null,
      });
    }

    const serviceId = (result.rows[0] as any).PATTERN_ID;

    // Update
    const updateQuery = `
      UPDATE TIMETABLE_SERVICE_PATTERN
      SET
        PATTERN_NAME = :serviceNameNew,
        DIRECTION = :direction,
        TRAVEL_TIMES = :travelTimes
      WHERE PATTERN_ID = :serviceId
    `;

    const updateResult = await connection.execute(updateQuery, [serviceNameNew, direction, JSON.stringify(TRAVEL_TIMES), serviceId]);

    if (updateResult.rowsAffected !== 1) {
      return res.status(404).json({
        message: "Service pattern could not be updated",
        success: false,
        data: null,
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: "Service pattern updated successfully",
      success: true,
    });
  } catch (e) {
    console.error(e);

    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error(error);
      }
    }
  }
};

const deleteServicePatterns = async (req: Request, res: Response) => {
  let connection;
  try {
    connection = await getConnection();
    const { lineId } = req.params;
    const { direction, patternName } = req.body;
    if (!lineId || !direction || !patternName) {
      return res.status(400).json({
        message: "Please provide Line Id,Direction and Pattern Name",
        success: false,
      });
    }
    const result = await connection.execute(
      `SELECT * FROM TIMETABLE_SERVICE_PATTERN WHERE LINE_ID = :lineId AND DIRECTION = :direction AND PATTERN_NAME = :patternName`,
      [lineId, direction, patternName],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "Service Pattern not found", success: false });
    }
    const deltePatternId = (result.rows[0] as any).PATTERN_ID;
    const deletePattern = await connection.execute(`DELETE FROM TIMETABLE_SERVICE_PATTERN WHERE PATTERN_ID = :patternId`, [deltePatternId], {
      autoCommit: true,
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    if (deletePattern.rowsAffected === 1) {
      return res.status(200).json({
        message: "Service Pattern deleted successfully",
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Internal server error",
      error: e,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error(error);
      }
    }
  }
};

export { getAllLines, getLineStations, getServicePatterns, createServicePatterns, updateServicePatterns, deleteServicePatterns };
//getAllLines, getLineStations,getJunctions,getServicePatterns,createServicePatterns,updateServicePatterns,deleteServicePatterns
