-- payment-services writes into its own schema. Hibernate (ddl-auto: update) creates
-- the tables but never the schema itself, so this has to be run once per database.
CREATE SCHEMA IF NOT EXISTS payment_service;
