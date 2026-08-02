import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TimetableRow {
  trainId: string;
  sourceStation: string;
  destinationStation: string;
  direction: number;
  startTime: string;
  endTime: string;
}

export interface PreviewData {
  uploadName: string;
  lineId: number;
  runDayType: number;
  timetable: TimetableRow[];
}

interface PreviewState {
  data: PreviewData | null;
  isDirty: boolean;
}

const initialState: PreviewState = {
  data: null,
  isDirty: false,
};

const previewSlice = createSlice({
  name: "preview",

  initialState,

  reducers: {
    setPreview(state, action: PayloadAction<PreviewData>) {
      state.data = action.payload;
      state.isDirty = false;
    },

    updatePreview(state, action: PayloadAction<PreviewData>) {
      state.data = action.payload;
      state.isDirty = true;
    },

    clearPreview(state) {
      state.data = null;
      state.isDirty = false;
    },
  },
});

export const { setPreview, updatePreview, clearPreview } = previewSlice.actions;

export default previewSlice.reducer;
