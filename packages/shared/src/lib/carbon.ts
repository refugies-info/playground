/** EcoLogits estimate of a report's generated tokens, in grams of CO2 eq. */
export type CarbonImpact = { gwpMinGrams: number; gwpMaxGrams: number };

const GRAMS = new Intl.NumberFormat("fr-FR", { maximumSignificantDigits: 2 });

export const ECOLOGITS_URL = "https://ecologits.ai";

// Upper bound only: "0,088 g CO₂e"
export const formatCarbonImpact = ({ gwpMaxGrams }: CarbonImpact) =>
  `${GRAMS.format(gwpMaxGrams)} g CO₂e`;
