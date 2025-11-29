-- Resume Analysis Feature - Database Schema
-- Add to existing database (run after interview_prep schema)

-- ============================================
-- Table: user_profiles
-- Stores parsed resume data and AI-generated insights
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,  -- Will link to auth users table later
  
  -- File metadata
  file_name VARCHAR(255),
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personal Information
  full_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  location VARCHAR(255),
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  
  -- Profile Data (JSONB for flexibility)
  summary TEXT,
  skills JSONB DEFAULT '{}'::jsonb,  -- {technical, languages, frameworks, tools, soft}
  experience JSONB DEFAULT '[]'::jsonb,  -- Array of experience objects
  education JSONB DEFAULT '[]'::jsonb,  -- Array of education objects
  certifications JSONB DEFAULT '[]'::jsonb,  -- Array of certification objects
  projects JSONB DEFAULT '[]'::jsonb,  -- Array of project objects
  
  -- AI Analysis Results
  skill_proficiency JSONB DEFAULT '[]'::jsonb,  -- Array of proficiency analysis
  top_strengths TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience_level VARCHAR(50),  -- junior, mid, senior
  total_years_experience NUMERIC(4,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON user_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON user_profiles(experience_level);

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_profiles IS 'Stores parsed resume data and AI-generated career profiles';
COMMENT ON COLUMN user_profiles.skills IS 'JSON: {technical, languages, frameworks, tools, soft}';
COMMENT ON COLUMN user_profiles.experience IS 'JSON Array: [{title, company, startDate, endDate, responsibilities, achievements, technologies}]';
COMMENT ON COLUMN user_profiles.education IS 'JSON Array: [{degree, field, institution, graduationDate, gpa, achievements}]';
COMMENT ON COLUMN user_profiles.skill_proficiency IS 'JSON Array: [{skill, level, yearsOfExperience, context}]';

-- SUCCESS message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Resume Analysis schema created successfully!';
    RAISE NOTICE '📊 Table: user_profiles';
    RAISE NOTICE '🔧 Triggers and indexes created';
END $$;
