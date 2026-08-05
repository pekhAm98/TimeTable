import { configureStore } from "@reduxjs/toolkit";

import previewReducer from "./previewSlice";
import uploadSelectionReducer from "./uploadSelectionSlice";
import searchAndFilterReducer from "./searchAndFilterSlice";
import { api } from "./api/api";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import storageSession from "redux-persist/lib/storage/session";

const previewPersistConfig = {
  key: "preview",
  storage: storageSession,
};

const uploadSelectionPersistConfig = {
  key: "uploadSelection",
  storage: storageSession,
};


const searchAndFilterPersistConfig = {
  key: "searchAndFilter",
  storage: storageSession,
};


const persistedPreviewReducer = persistReducer(
  previewPersistConfig,
  previewReducer
);

const persistedUploadSelectionReducer = persistReducer(
  uploadSelectionPersistConfig,
  uploadSelectionReducer
);

const persistedSearchAndFilterReducer = persistReducer(
  searchAndFilterPersistConfig,
  searchAndFilterReducer
);
export const store = configureStore({
  reducer: {
    preview: persistedPreviewReducer,
    uploadSelection: persistedUploadSelectionReducer,
    searchAndFilter: persistedSearchAndFilterReducer,

    [api.reducerPath]: api.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    })
    .concat(api.middleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;