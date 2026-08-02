import { configureStore } from "@reduxjs/toolkit";

import previewReducer from "./previewSlice";


export const store = configureStore({

  reducer: {
    preview: previewReducer,
  },

});


export type RootState = ReturnType<
  typeof store.getState
>;


export type AppDispatch = typeof store.dispatch;