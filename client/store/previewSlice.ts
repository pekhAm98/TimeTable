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
  new?: boolean;
}

export interface PreviewData {
  uploadName: string;
  lineId: number;
  runDayType: number;
  timetable: TimetableRow[];
  previewId?: number;
  status: string;
}

interface PreviewState {
  data: PreviewData | null;
  originalData: PreviewData | null;
  isDirty: boolean;
  source: "UPLOAD" | "HISTORY";
  uploadId?: number;
  previewId?: number;
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
      state.previewId = action.payload.previewId;
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
      state.previewId = action.payload.previewId ?? state.previewId;
    },

    clearPreview(state) {
      state.data = null;
      state.originalData = null;
      state.isDirty = false;
      state.previewId = undefined;
    },

    cleanState(state) {state.isDirty = false;},
    setDirty(state) {state.isDirty = true;},
  },
});

export const { setPreviewData, setPreviewSource, updatePreview, clearPreview, cleanState, setDirty } = previewSlice.actions;

export default previewSlice.reducer;
