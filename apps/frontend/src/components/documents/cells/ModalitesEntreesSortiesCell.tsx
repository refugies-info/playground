"use client";

import { EmptyDash } from "@playground/ui/composites";

interface ModalitesEntreesSortiesCellProps {
  value: string | null | undefined;
}

export const ModalitesEntreesSortiesCell = ({
  value,
}: ModalitesEntreesSortiesCellProps) => {
  if (value === "0")
    return <div className="text-sm whitespace-nowrap">À dates fixes</div>;
  if (value === "1")
    return <div className="text-sm whitespace-nowrap">Entrées permanentes</div>;
  return <EmptyDash />;
};
ModalitesEntreesSortiesCell.displayName = "ModalitesEntreesSortiesCell";
