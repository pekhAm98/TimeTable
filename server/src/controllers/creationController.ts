import { type Request, type Response } from "express";
import allLines from "../constants/allLines.js";
import { getConnection } from "../config/db.js";
import oracledb from "oracledb";

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
        await connection.release();
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
   const result = await connection.execute(
  query,
  [lineId, direction.toString().toUpperCase()],
  {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
    fetchInfo: {
      TRAVEL_TIMES: {
        type: oracledb.STRING
      }
    }
  }
);
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
        await connection.release();
      } catch (error) {
        console.error(error);
      }
    }
  }
};

const createServicePatterns = async (req: Request, res: Response) => {
    
    const { lineId, direction, serviceName,TRAVEL_TIMES } = req.body;
    let connection : oracledb.Connection | undefined;
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
    const line = allLines.find((line) => line.id === lineId);
    if (!line) {
        res.status(400).json({ message: "Line not found" });
        return;
    }

    //CHECKING THE TRAVEL TIMES LENGTH
    try {
        connection = await getConnection();
        const result : oracledb.Result<{ COUNT: number }> = await connection.execute(
            `SELECT COUNT(*) FROM TIMETABLE_LINE_STATION_SEQUENCE WHERE LINE_ID = :lineId`,
            { lineId}
        );
        const count = result.rows?.[0]?.COUNT;
        if (!count || count === 0) {
                res.status(404).json({ message: "Line Stations not found" });
                return;
        }
        if (TRAVEL_TIMES.length !== count -1 || !Array.isArray(TRAVEL_TIMES) || !Array.isArray(TRAVEL_TIMES)) {
            res.status(400).json({
                message: "Invalid travel times",
            });
            return;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch line stations", error: error instanceof Error ? error.message : String(error) });
        return;
    }

    
    const query = `INSERT INTO TIMETABLE_SERVICE_PATTERN (LINE_ID, DIRECTION, SERVICE_PATTERN, TRAVEL_TIMES) VALUES (:lineId, :direction, :serviceName, :travelTimes)`;
    
    try {
        connection = await getConnection();
        await connection.execute(query, [lineId, direction.toString().toUpperCase(), serviceName, JSON.stringify(TRAVEL_TIMES)]);
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
                await connection.release();
            } catch (error) {
                console.error(error);
            }
        }
    }

};
const updateServicePatterns = async (req: Request, res: Response) => {};
const deleteServicePatterns = async (req: Request, res: Response) => {};
export { getAllLines, getLineStations, getServicePatterns ,createServicePatterns,updateServicePatterns,deleteServicePatterns};
//getAllLines, getLineStations,getJunctions,getServicePatterns,createServicePatterns,updateServicePatterns,deleteServicePatterns
