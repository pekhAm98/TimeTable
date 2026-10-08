import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TimetableTrain } from "@/app/createtimetable/page";




type TimetableState = {
  trains: TimetableTrain[];
};

const initialState: TimetableState = {
  trains: [],
};

const timetableSlice = createSlice({
  name: "timetable",
  initialState,
  reducers: {
    addTrains: (state, action: PayloadAction<TimetableTrain[]>) => {
      state.trains.push(...action.payload);
    },

    removeTrain: (state, action: PayloadAction<number>) => {
      state.trains = state.trains.filter(
        (train) => train.trainId !== action.payload
      );
    },

    clearTrains: (state) => {
      state.trains = [];
    },
  },
});
export const { addTrains, removeTrain,clearTrains} = timetableSlice.actions;
export default timetableSlice.reducer;