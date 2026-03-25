"use client";

import { EmptyDash } from "@playground/ui/primitives";

interface ModalitesEntreesSortiesCellProps {
  value: string | null | undefined;
}

export const ModalitesEntreesSortiesCell = ({
  value,
}: ModalitesEntreesSortiesCellProps) => {
  if (value === "0") return <div className="text-sm">Permanentes</div>;
  if (value === "1") return <div className="text-sm">Dates fixes</div>;
  return <EmptyDash />;
};
ModalitesEntreesSortiesCell.displayName = "ModalitesEntreesSortiesCell";
