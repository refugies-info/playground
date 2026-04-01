"use client";

import { EmptyDash } from "@playground/ui/composites";
import { Badge } from "@playground/ui/primitives";
import { getQualityScoreVariant } from "@/lib/document-labels";

interface QualityScoreCellProps {
  score: number | null | undefined;
}

export const QualityScoreCell = ({ score }: QualityScoreCellProps) => {
  if (score === undefined || score === null) return <EmptyDash />;
  const percentage = Math.round(score * 100);
  return <Badge variant={getQualityScoreVariant(score)}>{percentage}%</Badge>;
};
QualityScoreCell.displayName = "QualityScoreCell";
