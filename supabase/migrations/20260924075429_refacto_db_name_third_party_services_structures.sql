ALTER TABLE di_services RENAME TO services;

CREATE TYPE origin AS ENUM (
  'RCO',
  'DI'
);

ALTER TABLE services
    ADD COLUMN origin origin NOT NULL DEFAULT 'DI';