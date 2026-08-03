import ALL_STATIONS from "../../constants/allStations.js";
export interface PreviewData {
  uploadName: string;
  lineId: number;
  runDayType: number;
  timetable: TimetableRow[];
}
export interface TimetableRow {
  trainId: string;
  sourceStation: string;
  destinationStation: string;
  direction: number;
  startTime: string;
  endTime: string;
  changed?: boolean;
}

const LINE_PREFIX: Record<number, string> = {
  1: "B", // Blue
  2: "G", // Green
  3: "P", // Purple
  4: "Y", // Yellow
  5: "PK", // Pink
  6: "O", // Orange
};

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}


/////KNOA_KNAP CHECK and invalid station check
function normalizeStation(station: string) {
  const rawStation = station.trim().toUpperCase();
  const stationAliases: Record<string, string> = {
    KNAP: "KNOA",
  };
  const normalizedStation = stationAliases[rawStation] ?? rawStation;

  if (!ALL_STATIONS.includes(normalizedStation)) {
    throw new Error(`Invalid station name: ${normalizedStation}`);
  }

  return normalizedStation;
}

//YELLOW LINE DIRECTION IS REVERSED INTERNALLY
function normalizeDirection(
  lineId: number,
  direction: number
) {

  // Yellow line direction is reversed internally
  let normalizedDirection = direction;
  if (lineId === 4) {
    normalizedDirection = direction === 0 ? 1 : 0;
  }
  if(![0, 1].includes(normalizedDirection)) {
    throw new Error(`Invalid direction value: ${direction}. Must be 0 or 1.`);
  }

  return normalizedDirection;
}


function normalizeTrainId(
  trainId: string,
  lineId: number
) {

  if (!trainId || !trainId.trim()) {
    throw new Error(`Invalid train ID: ${trainId}`);
  }

  const prefix = LINE_PREFIX[lineId];
  if (!prefix) {
    throw new Error(`Invalid line ID: ${lineId}`);
  }

  return `${prefix}_${trainId}`;
}


 function transformTimetable(
  preview: PreviewData
): (TimetableRow & { runDayType: number; lineId: number })[] {

 if(!preview.lineId || !LINE_PREFIX[preview.lineId]) {
    throw new Error(`Invalid line ID: ${preview.lineId}`);
  }

if(!preview.runDayType || ![1, 2, 4].includes(preview.runDayType)) {
    throw new Error(`Invalid run day type: ${preview.runDayType}`);
  }

  return preview.timetable.map((row) => ({
    
    trainId: normalizeTrainId(
      row.trainId,
      preview.lineId
    ),

    sourceStation: normalizeStation(
      row.sourceStation.toUpperCase().trim()
    ),

    destinationStation: normalizeStation(
      row.destinationStation.toUpperCase().trim()
    ),

    direction: normalizeDirection(
      preview.lineId,
      row.direction
    ),

    startTime: row.startTime,

    endTime: row.endTime,

    runDayType: preview.runDayType,

    lineId: preview.lineId,
  }));
}
export interface TransformedPreviewData extends PreviewData {
  timetable: (TimetableRow & { runDayType: number; lineId: number })[];
}

 function validateTimetable(
  preview: TransformedPreviewData
): ValidationError[] {

  const errors: ValidationError[] = [];

  preview.timetable.forEach((row, index) => {
    const rowNumber = index + 1; // user-facing row number

    if (!row.trainId?.trim()) {
      errors.push({
        row: rowNumber,
        field: "trainId",
        message: "Train ID is empty",
      });
    }

    if (!row.sourceStation?.trim()) {
      errors.push({
        row: rowNumber,
        field: "sourceStation",
        message: "Source station is empty",
      });
    }

    if (!row.destinationStation?.trim()) {
      errors.push({
        row: rowNumber,
        field: "destinationStation",
        message: "Destination station is empty",
      });
    }

    if (
      row.direction === null ||
      row.direction === undefined ||
      row.direction === ("" as any)
    ) {
      errors.push({
        row: rowNumber,
        field: "direction",
        message: "Direction is empty",
      });
    }

    if (!row.startTime?.trim()) {
      errors.push({
        row: rowNumber,
        field: "startTime",
        message: "Start time is empty",
      });
    }

    if (!row.endTime?.trim()) {
      errors.push({
        row: rowNumber,
        field: "endTime",
        message: "End time is empty",
      });
    }
  });

  return errors;
}

export const transformAndValidateTimetable = (
  preview: PreviewData
): { transformed: TransformedPreviewData; errors?: ValidationError[] } => {
  
  try {
    const transformed: TransformedPreviewData = {
    ...preview,
    timetable: transformTimetable(preview),
  };

  const errors = validateTimetable(transformed);
  if (errors.length > 0) {
    throw new Error("Validation errors found in timetable");
  }
  return { transformed };
  } catch (error) {
    return { transformed: { ...preview, timetable: [] }, errors: [{ row: 0, field: "general", message: (error as Error).message }] };
  }
};