-- EcoLogits estimate of the generated tokens: { gwpMinGrams, gwpMaxGrams }.
-- Null for reports created before, or when the model is unknown to EcoLogits.
alter table public.letta_reports add column carbon_impact jsonb;
