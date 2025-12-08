-- Migration: content_flows_triggers
-- Description: Automates content_flows updates via triggers on rco, ingestion, and editorial records.

-- 1. Trigger for NEW rco_records
CREATE OR REPLACE FUNCTION public.handle_new_rco_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.content_flows (rco_record_id, progress, status)
  VALUES (NEW.id, 'rco', 'unknown');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_rco_record
AFTER INSERT ON public.rco_records
FOR EACH ROW EXECUTE FUNCTION public.handle_new_rco_record();

-- 2. Trigger for NEW ingestion_records
CREATE OR REPLACE FUNCTION public.handle_new_ingestion_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the content_flow linked to the RCO record
  UPDATE public.content_flows
  SET
    ingestion_record_id = NEW.id,
    progress = 'ingestion'
  WHERE rco_record_id = NEW.rco_record_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_ingestion_record
AFTER INSERT ON public.ingestion_records
FOR EACH ROW EXECUTE FUNCTION public.handle_new_ingestion_record();

-- 3. Trigger for NEW editorial_records
CREATE OR REPLACE FUNCTION public.handle_new_editorial_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the content_flow linked to the Ingestion record
  UPDATE public.content_flows
  SET
    editorial_record_id = NEW.id,
    progress = 'editorial'
  WHERE ingestion_record_id = NEW.ingestion_record_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_editorial_record
AFTER INSERT ON public.editorial_records
FOR EACH ROW EXECUTE FUNCTION public.handle_new_editorial_record();
