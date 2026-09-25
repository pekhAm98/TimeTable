import { createSlice, PayloadAction } from "@reduxjs/toolkit";



interface CreateState {
  creationName: string;
  lineId: number | null;
  runDayType: number | null;
}

const initialState: CreateState = {
  creationName: "",
  lineId: null,
  runDayType: null,
};


const createSelectionSlice = createSlice({
  name: "createSelection",
  initialState,
  reducers: {
    setCreationName(state, action: PayloadAction<string>) {
      state.creationName = action.payload;
    },
    setLineId(state, action: PayloadAction<number | null>) {
      state.lineId = action.payload;
    },
    setRunDayType(state, action: PayloadAction<number | null>) {
      state.runDayType = action.payload;
    },
  },
});

export const { setCreationName, setLineId, setRunDayType } = createSelectionSlice.actions;
export default createSelectionSlice.reducer;