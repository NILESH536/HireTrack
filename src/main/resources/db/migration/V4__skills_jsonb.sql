-- If previously created as TEXT, convert
ALTER TABLE students ALTER COLUMN skills TYPE JSONB USING CASE WHEN skills IS NULL THEN '[]'::jsonb ELSE skills::jsonb END;
ALTER TABLE students ALTER COLUMN skills SET DEFAULT '[]'::jsonb;
