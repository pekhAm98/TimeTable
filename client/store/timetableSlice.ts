import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TimetableTrain } from "@/app/createtimetable/page";

type TrainNamingConfig = {
prefix: string;
nextSequence: number;
increment: number;
};

type TimetableState = {
trains: TimetableTrain[];
namingConfig: TrainNamingConfig;
};

const initialNamingConfig: TrainNamingConfig = {
prefix: "TRAIN",
nextSequence: 1,
increment: 2,
};

const initialState: TimetableState = {
trains: [],
namingConfig: { ...initialNamingConfig },
};

const timetableSlice = createSlice({
name: "timetable",
initialState,
reducers: {
addTrains: (state, action: PayloadAction<TimetableTrain[]>) => {
state.trains.push(...action.payload);
state.namingConfig.nextSequence +=
    action.payload.length * state.namingConfig.increment;
},
setTrains: (state, action: PayloadAction<TimetableTrain[]>) => {
  state.trains = action.payload;
},

removeTrain: (state, action: PayloadAction<number>) => {
  state.trains = state.trains.filter(
    (train) => train.trainId !== action.payload
  );
},

updateTrain: (
  state,
  action: PayloadAction<{
    trainId: number;
    changes: Partial<TimetableTrain>;
  }>
) => {
  const train = state.trains.find(
    (train) => train.trainId === action.payload.trainId
  );

  if (train) {
    Object.assign(train, action.payload.changes);
  }
},

updateNamingConfig: (
  state,
  action: PayloadAction<Partial<TrainNamingConfig>>
) => {
  Object.assign(state.namingConfig, action.payload);
},

resetNamingConfig: (state) => {
  state.namingConfig = { ...initialNamingConfig };
},

clearTrains: (state) => {
  state.trains = [];
},
},
});

export const {
addTrains,
setTrains,
removeTrain,
updateTrain,
updateNamingConfig,
resetNamingConfig,
clearTrains,
} = timetableSlice.actions;

export default timetableSlice.reducer;