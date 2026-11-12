-- Turns on pgvector: the add-on that gives Postgres the "vector" column type and the
-- "find the closest vectors" operators. Must run before any table uses a vector column.
CREATE EXTENSION IF NOT EXISTS vector;
