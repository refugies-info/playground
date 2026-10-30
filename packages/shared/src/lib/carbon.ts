/** EcoLogits estimate of a report's generated tokens, in grams of CO2 eq. */
export type CarbonImpact = { gwpMinGrams: number; gwpMaxGrams: number };

const GRAMS = new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 2 });

// "0,08 – 0,09 g CO₂e"
export const formatCarbonImpact = ({
  gwpMinGrams,
  gwpMaxGrams,
}: CarbonImpact) =>
  `${GRAMS.format(gwpMinGrams)} – ${GRAMS.format(gwpMaxGrams)} g CO₂e`;
