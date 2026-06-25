"use client";

import type { ReactNode } from "react";
import { TranslationProvider } from "./TranslationContext";
import { TranslationSidebar } from "./TranslationSidebar";
import { TranslationTopBar } from "./TranslationTopBar";

interface TranslationLayoutProps {
  // biome-ignore lint/suspicious/noExplicitAny: generic data prop
  initialData: any;
  children: ReactNode;
}

export function TranslationLayout({
  initialData,
  children,
}: TranslationLayoutProps) {
  return (
    <TranslationProvider initialData={initialData}>
      <div className="flex flex-1 flex-col flex-1 overflow-hidden bg-white">
        <TranslationTopBar />

        <div className="flex flex-1 overflow-hidden">
          <TranslationSidebar />
          {children}
        </div>
      </div>
    </TranslationProvider>
  );
}
