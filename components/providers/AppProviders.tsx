"use client";

import { Toaster } from "react-hot-toast";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { PreferencesSync } from "@/components/providers/PreferencesSync";
import { ReduxProvider } from "@/redux/reduxProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <AuthBootstrap />
      <PreferencesSync />
      {children}
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
    </ReduxProvider>
  );
}
