"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

interface ContentContextType {
  /** True for 300ms after the source panel is toggled — active la transition
   * CSS sur le padding de CenterContent uniquement pendant l'animation. */
  isPaddingTransitionActive: boolean;
  activatePaddingTransition: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [isPaddingTransitionActive, setIsPaddingTransitionActive] =
    useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activatePaddingTransition = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPaddingTransitionActive(true);
    timeoutRef.current = setTimeout(
      () => setIsPaddingTransitionActive(false),
      300,
    );
  }, []);

  return (
    <ContentContext.Provider
      value={{ isPaddingTransitionActive, activatePaddingTransition }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContentContext() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContentContext must be used within a ContentProvider");
  }
  return context;
}
