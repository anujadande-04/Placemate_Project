-- Add columns for persistent ATS and Skills data storage
-- Run these SQL commands in your Supabase database

-- Add skills assessment results storage
CREATE TABLE IF NOT EXISTS user_skill_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id VARCHAR(255) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessment_data JSONB, -- Store full assessment details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_id)
);

-- Add ATS analysis results storage (if not already exists)
ALTER TABLE student_details 
ADD COLUMN IF NOT EXISTS ats_analysis_data JSONB,
ADD COLUMN IF NOT EXISTS ats_last_updated TIMESTAMP WITH TIME ZONE;

-- Add skills summary to student_details
ALTER TABLE student_details 
ADD COLUMN IF NOT EXISTS skills_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skills_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skills_average_score DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS skills_last_updated TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_skill_assessments_user_id ON user_skill_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_assessments_skill_id ON user_skill_assessments(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_assessments_completed_at ON user_skill_assessments(completed_at);

-- Enable Row Level Security
ALTER TABLE user_skill_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_skill_assessments
CREATE POLICY "Users can view their own skill assessments" ON user_skill_assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill assessments" ON user_skill_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill assessments" ON user_skill_assessments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill assessments" ON user_skill_assessments
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_skill_assessments_updated_at 
    BEFORE UPDATE ON user_skill_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();