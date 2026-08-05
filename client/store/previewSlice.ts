import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { normalizeTimeToHms } from "@/src/lib/time";

export interface TimetableRow {
  trainId: string;
  sourceStation: string;
  destinationStation: string;
  direction: number;
  startTime: string;
  endTime: string;
  changed?: boolean;
}

export interface PreviewData {
  uploadName: string;
  lineId: number;
  runDayType: number;
  timetable: TimetableRow[];
}

interface PreviewState {
  data: PreviewData | null;
  originalData: PreviewData | null;
  isDirty: boolean;
  source: "UPLOAD" | "HISTORY";
  uploadId?: number;
}
const initialState: PreviewState = {
  data: null,
  originalData: null,
  source: "UPLOAD",
  uploadId: undefined,
  isDirty: false,
};

function normalizeRowTimes<T extends TimetableRow>(row: T): T {
  const normalizedStartTime = normalizeTimeToHms(row.startTime);
  const normalizedEndTime = normalizeTimeToHms(row.endTime);

  return {
    ...row,
    startTime: normalizedStartTime ?? row.startTime,
    endTime: normalizedEndTime ?? row.endTime,
  };
}

const previewSlice = createSlice({
  name: "preview",

  initialState,

  reducers: {
    setPreviewData(state, action: PayloadAction<PreviewData>) {
      const normalizedPayload: PreviewData = {
        ...action.payload,
        timetable: action.payload.timetable.map((row) => ({
          ...normalizeRowTimes(row),
          changed: false,
        })),
      };

      state.data = normalizedPayload;
      state.originalData = normalizedPayload;
      state.isDirty = false;
    },

    setPreviewSource(state, action: PayloadAction<"UPLOAD" | "HISTORY">) {
      state.source = action.payload;
    },  

    updatePreview(state, action: PayloadAction<PreviewData>) {
      const normalizedPayload: PreviewData = {
        ...action.payload,
        timetable: action.payload.timetable.map((row) => normalizeRowTimes(row)),
      };

      state.data = normalizedPayload;
      state.isDirty = normalizedPayload.timetable.some((row) => Boolean(row.changed));
    },

    clearPreview(state) {
      state.data = null;
      state.originalData = null;
      state.isDirty = false;
    },

    cleanState(state) {state.isDirty = false;},
  },
});

export const { setPreviewData, setPreviewSource, updatePreview, clearPreview } = previewSlice.actions;

export default previewSlice.reducer;
