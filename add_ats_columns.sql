-- SQL Migration to add ATS columns to student_details table
-- Run this in your Supabase SQL Editor

-- First, check if the columns already exist
DO $$ 
BEGIN
    -- Add ats_score column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_details' 
        AND column_name = 'ats_score'
    ) THEN
        ALTER TABLE student_details ADD COLUMN ats_score NUMERIC;
        RAISE NOTICE 'Added ats_score column';
    ELSE
        RAISE NOTICE 'ats_score column already exists';
    END IF;

    -- Add ats_analysis column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_details' 
        AND column_name = 'ats_analysis'
    ) THEN
        ALTER TABLE student_details ADD COLUMN ats_analysis JSONB;
        RAISE NOTICE 'Added ats_analysis column';
    ELSE
        RAISE NOTICE 'ats_analysis column already exists';
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_details'
AND column_name IN ('ats_score', 'ats_analysis')
ORDER BY column_name;

-- Add comments to the columns for documentation
COMMENT ON COLUMN student_details.ats_score IS 'ATS compatibility score (0-100)';
COMMENT ON COLUMN student_details.ats_analysis IS 'Detailed ATS analysis results in JSON format';