"use client";

import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "../store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster theme="dark" position="top-right" />
    </Provider>
  );
}

export default ReduxProvider;
