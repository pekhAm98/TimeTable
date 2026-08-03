import { createSlice, PayloadAction } from "@reduxjs/toolkit";



interface UploadState {
  uploadName: string;
  lineId: number | null;
  runDayType: number | null;
}

const initialState: UploadState = {
  uploadName: "",
  lineId: null,
  runDayType: null,
};


const uploadSelectionSlice = createSlice({
  name: "uploadSelection",
  initialState,
  reducers: {
    setUploadName(state, action: PayloadAction<string>) {
      state.uploadName = action.payload;
    },
    setLineId(state, action: PayloadAction<number | null>) {
      state.lineId = action.payload;
    },
    setRunDayType(state, action: PayloadAction<number | null>) {
      state.runDayType = action.payload;
    },
  },
});

export const { setUploadName, setLineId, setRunDayType } = uploadSelectionSlice.actions;
export default uploadSelectionSlice.reducer;