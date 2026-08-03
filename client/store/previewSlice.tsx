import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
  previewId?: number;
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
  originalUploadId?: number;
}
const initialState: PreviewState = {
  data: null,
  originalData: null,
  source: "UPLOAD",
  originalUploadId: undefined,
  isDirty: false,
};

const previewSlice = createSlice({
  name: "preview",

  initialState,

  reducers: {
    setPreviewData(state, action: PayloadAction<PreviewData>) {
      const normalizedPayload: PreviewData = {
        ...action.payload,
        timetable: action.payload.timetable.map((row) => ({
          ...row,
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
      state.data = action.payload;
      state.isDirty = action.payload.timetable.some((row) => Boolean(row.changed));
    },

    clearPreview(state) {
      state.data = null;
      state.originalData = null;
      state.isDirty = false;
    },
  },
});

export const { setPreviewData, setPreviewSource, updatePreview, clearPreview } = previewSlice.actions;

export default previewSlice.reducer;
