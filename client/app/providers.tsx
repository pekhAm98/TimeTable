"use client";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { persistor, store } from "../store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
        <Toaster theme="dark" position="top-right" />
      </PersistGate>
    </Provider>
  );
}

export default ReduxProvider;
