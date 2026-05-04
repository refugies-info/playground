"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { setSidebarCollapsed } from "@/app/actions/sidebar";

interface SidebarContextValue {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export function SidebarProvider({
  children,
  initialCollapsed = false,
}: {
  children: React.ReactNode;
  initialCollapsed?: boolean;
}) {
  const [isCollapsed, setIsCollapsedState] = useState(initialCollapsed);

  const setIsCollapsed = useCallback((value: boolean) => {
    setIsCollapsedState(value);
    // Persistance cookie fire-and-forget (lisible côté serveur au prochain rendu)
    setSidebarCollapsed(value);
  }, []); // référence stable — évite les boucles de rendering dans les useEffect consumers

  // useMemo évite de recréer l'objet de contexte à chaque render → pas de re-render inutile des consumers
  const value = useMemo(
    () => ({ isCollapsed, setIsCollapsed }),
    [isCollapsed, setIsCollapsed],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
