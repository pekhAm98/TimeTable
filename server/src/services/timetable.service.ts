import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeTimeToHmsOrThrow } from "../utils/timeFormat.js";
import {RUN_DAY_MAP, LINE_ID_MAP, DIRECTION_MAP, } from "../constants/maps.js";


export interface PreviewRequest {
  uploadName: string;
  lineId: number;
  runDayType: number;
}

export interface TrainRow {
  trainId: string;
  sourceStation: string;
  destinationStation: string;
  direction: number;
  startTime: string;
  endTime: string;
  lineId: number;
  runDayType: number;
}

export interface PreviewResult {
  uploadName: string;
  lineId: number;
  runDayType: number;
  timetable: TrainRow[];
}

interface CsvRow {
  "TRAIN ID": string;
  "SOURCE STATION": string;
  "DESTINATION STATION": string;
  DIRECTION: string;
  "START TIME": string;
  "RUN DAY": string;
  "END TIME": string;
  "LINE ID": string;
}

interface ParsedCsv {
  rows: CsvRow[];
  firstDataRowNumber: number;
}

const REQUIRED_HEADERS = [
  "TRAIN ID",
  "SOURCE STATION",
  "DESTINATION STATION",
  "DIRECTION",
  "START TIME",
  "RUN DAY",
  "END TIME",
] as const;

export async function generatePreview(file: Express.Multer.File, request: PreviewRequest): Promise<PreviewResult> {
  const normalizedRequest = normalizeRequest(request);

  const csv = isLikelyXlsx(file.buffer)
    ? convertXlsxToCsv(file.buffer)
    : file.buffer.toString("utf8");

  const parsed = parseCsv(csv);

  const timetable = normalizeRows(parsed.rows, normalizedRequest, parsed.firstDataRowNumber);

  return {
    uploadName: String(request.uploadName ?? ""),
    lineId: normalizedRequest.lineId,
    runDayType: normalizedRequest.runDayType,
    timetable,
  };
}

function isLikelyXlsx(buffer: Buffer): boolean {
  return buffer.length >= 2 && buffer[0] === 0x50 && buffer[1] === 0x4b;
}

function convertXlsxToCsv(buffer: Buffer): string {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new Error("Excel file has no sheets");
    }

    const firstSheet = workbook.Sheets[firstSheetName];

    if (!firstSheet) {
      throw new Error("Unable to read first sheet from Excel file");
    }

    return XLSX.utils.sheet_to_csv(firstSheet, { blankrows: false });
  } catch {
    throw new Error("Unable to parse uploaded Excel file. Please upload a valid .xlsx or .csv file.");
  }
}

function normalizeRequest(request: PreviewRequest): PreviewRequest {
  const lineId = parseLineId(request.lineId);
  const runDayType = parseRunDayType(request.runDayType);

  return {
    ...request,
    lineId,
    runDayType,
  };
}

function parseLineId(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const asNumber = Number(trimmed);

    if (Number.isFinite(asNumber)) {
      return asNumber;
    }

    const mapped = LINE_ID_MAP[trimmed.toUpperCase()];

    if (mapped !== undefined) {
      return mapped;
    }
  }

  throw new Error("Invalid lineId. Please select a valid line.");
}

function parseRunDayType(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const asNumber = Number(trimmed);

    if (Number.isFinite(asNumber)) {
      return asNumber;
    }

    const mapped = RUN_DAY_MAP[trimmed.toUpperCase()];

    if (mapped !== undefined) {
      return mapped;
    }
  }

  throw new Error("Invalid runDayType. Please select Weekday, Saturday, or Sunday.");
}

function parseCsv(csv: string): ParsedCsv {
  const result = Papa.parse<string[]>(csv, {
    header: false,
    skipEmptyLines: true,
    delimiter: "", // auto detect
  });


  if (result.errors.length > 0) {
    const error = result.errors[0];
    const row = error?.row ?? 0;
    const message = error?.message ?? "Unknown CSV parse error";

    throw new Error(`CSV Parse Error (Row ${row}): ${message}`);
  }


  const rawRows = result.data.filter((row): row is string[] => Array.isArray(row));
  const headerIndex = findHeaderIndex(rawRows);

  if (headerIndex === -1) {
    throw new Error("Could not find required headers in uploaded file.");
  }

  const headerRow = rawRows[headerIndex] ?? [];
  const headerMap = buildHeaderMap(headerRow);

  const rows: CsvRow[] = [];

  for (let i = headerIndex + 1; i < rawRows.length; i++) {
    const current = rawRows[i] ?? [];

    if (current.every((cell) => !String(cell ?? "").trim())) {
      continue;
    }

    rows.push({
      "TRAIN ID": getCell(current, headerMap, "TRAIN ID"),
      "SOURCE STATION": getCell(current, headerMap, "SOURCE STATION"),
      "DESTINATION STATION": getCell(current, headerMap, "DESTINATION STATION"),
      DIRECTION: getCell(current, headerMap, "DIRECTION"),
      "START TIME": getCell(current, headerMap, "START TIME"),
      "RUN DAY": getCell(current, headerMap, "RUN DAY"),
      "END TIME": getCell(current, headerMap, "END TIME"),
      "LINE ID": getCell(current, headerMap, "LINE ID"),
    });
  }

  return {
    rows,
    firstDataRowNumber: headerIndex + 2,
  };
}

function findHeaderIndex(rawRows: string[][]): number {
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i] ?? [];
    const normalized = new Set(row.map((cell) => toKnownHeader(cell)).filter((v): v is string => Boolean(v)));
    const hasAllRequired = REQUIRED_HEADERS.every((header) => normalized.has(header));

    if (hasAllRequired) {
      return i;
    }
  }

  return -1;
}

function buildHeaderMap(headerRow: string[]): Record<string, number> {
  const map: Record<string, number> = {};

  headerRow.forEach((cell, index) => {
    const known = toKnownHeader(cell);

    if (known) {
      map[known] = index;
    }
  });

  return map;
}

function getCell(row: string[], headerMap: Record<string, number>, header: string): string {
  const idx = headerMap[header];

  if (idx === undefined) {
    return "";
  }

  return String(row[idx] ?? "").trim();
}

function toKnownHeader(header: string): string | undefined {
  const cleaned = String(header ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toUpperCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  const map: Record<string, string> = {
    "TRAIN ID": "TRAIN ID",
    "TRAIN NO": "TRAIN ID",
    "TRAIN NUMBER": "TRAIN ID",
    TRAINID: "TRAIN ID",
    "SOURCE STATION": "SOURCE STATION",
    "SOURCE": "SOURCE STATION",
    "SOURCE STN": "SOURCE STATION",
    "DESTINATION STATION": "DESTINATION STATION",
    DESTINATION: "DESTINATION STATION",
    "DESTINATION STN": "DESTINATION STATION",
    DIRECTION: "DIRECTION",
    DIR: "DIRECTION",
    DIRN: "DIRECTION",
    "START TIME": "START TIME",
    "START": "START TIME",
    "END TIME": "END TIME",
    END: "END TIME",
    "RUN DAY": "RUN DAY",
    RUNDAY: "RUN DAY",
    DAY: "RUN DAY",
    "LINE ID": "LINE ID",
    LINE: "LINE ID",
  };

  return map[cleaned];
}

function normalizeRows(rows: CsvRow[], request: PreviewRequest, firstDataRowNumber: number): TrainRow[] {
  const trainIds = new Set<string>();

  return rows.map((row, index) => {
    const rowNumber = firstDataRowNumber + index;

    const trainId = row["TRAIN ID"]?.trim();
    const sourceStation = row["SOURCE STATION"]?.trim();
    const destinationStation = row["DESTINATION STATION"]?.trim();
    const startTime = row["START TIME"]?.trim();
    const endTime = row["END TIME"]?.trim();

    if (!trainId) throw new Error(`Row ${rowNumber}: TRAIN ID is required.`);

    if (!sourceStation) throw new Error(`Row ${rowNumber}: SOURCE STATION is required.`);

    if (!destinationStation) throw new Error(`Row ${rowNumber}: DESTINATION STATION is required.`);

    if (!startTime) throw new Error(`Row ${rowNumber}: START TIME is required.`);

    if (!endTime) throw new Error(`Row ${rowNumber}: END TIME is required.`);

    if (trainIds.has(trainId)) throw new Error(`Row ${rowNumber}: Duplicate TRAIN ID '${trainId}'.`);

    trainIds.add(trainId);

    const directionText = row["DIRECTION"]?.trim().toUpperCase();

    const direction = DIRECTION_MAP[directionText];

    if (direction === undefined) throw new Error(`Row ${rowNumber}: Invalid DIRECTION '${row["DIRECTION"]}'. Expected UP or DOWN.`);

    const runDay = RUN_DAY_MAP[row["RUN DAY"]?.trim().toUpperCase()];

    if (runDay === undefined) throw new Error(`Row ${rowNumber}: Invalid RUN DAY '${row["RUN DAY"]}'.`);

    if (runDay !== request.runDayType) throw new Error(`Row ${rowNumber}: Uploaded file is for '${row["RUN DAY"]}', but '${request.runDayType}' was selected.`);

    const normalizedStartTime = normalizeTimeToHmsOrThrow(startTime, "START TIME", rowNumber);
    const normalizedEndTime = normalizeTimeToHmsOrThrow(endTime, "END TIME", rowNumber);

    return {
      trainId,
      sourceStation,
      destinationStation,
      direction,
      startTime: normalizedStartTime,
      endTime: normalizedEndTime,
      lineId: request.lineId,
      runDayType: request.runDayType,
    };
  });
}
