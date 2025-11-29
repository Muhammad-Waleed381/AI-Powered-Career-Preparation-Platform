-- AI Career Preparation Platform - Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- Table 1: interview_prep_sessions
-- Stores each interview preparation research session
-- ============================================

CREATE TABLE IF NOT EXISTS interview_prep_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,  -- Will link to users table later when auth is added
  company_name VARCHAR(255) NOT NULL,
  role_name VARCHAR(255) NOT NULL,
  technologies TEXT[] NOT NULL,
  status VARCHAR(50) DEFAULT 'processing',  -- processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON interview_prep_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON interview_prep_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON interview_prep_sessions(status);

COMMENT ON TABLE interview_prep_sessions IS 'Stores interview preparation research sessions';
COMMENT ON COLUMN interview_prep_sessions.status IS 'Session status: processing, completed, or failed';

-- ============================================
-- Table 2: interview_insights
-- Stores the AI-generated research insights
-- ============================================

CREATE TABLE IF NOT EXISTS interview_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_prep_sessions(id) ON DELETE CASCADE,
  company_insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  role_insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  tech_insights JSONB NOT NULL DEFAULT '[]'::jsonb,
  preparation_checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for session lookups
CREATE INDEX IF NOT EXISTS idx_insights_session_id ON interview_insights(session_id);

COMMENT ON TABLE interview_insights IS 'AI-generated insights for interview preparation';
COMMENT ON COLUMN interview_insights.company_insights IS 'JSON: {culture, values, practices, recentNews}';
COMMENT ON COLUMN interview_insights.role_insights IS 'JSON: {keyResponsibilities, requiredSkills, experienceLevel, focusAreas}';
COMMENT ON COLUMN interview_insights.tech_insights IS 'JSON Array: [{technology, recentUpdates, bestPractices, commonChallenges}]';
COMMENT ON COLUMN interview_insights.preparation_checklist IS 'JSON: {priorityTopics, studyTimeline, resources}';

-- ============================================
-- Table 3: interview_questions
-- Stores generated interview questions
-- ============================================

CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES interview_prep_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,  -- technical, behavioral, company_specific
  difficulty VARCHAR(50) NOT NULL,     -- junior, mid, senior
  category VARCHAR(100),                -- algorithm, system_design, culture_fit, etc.
  hints TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_bookmarked BOOLEAN DEFAULT false,
  practice_answer TEXT,
  practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON interview_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON interview_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON interview_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_bookmarked ON interview_questions(is_bookmarked) WHERE is_bookmarked = true;

COMMENT ON TABLE interview_questions IS 'AI-generated interview questions';
COMMENT ON COLUMN interview_questions.question_type IS 'Type: technical, behavioral, or company_specific';
COMMENT ON COLUMN interview_questions.difficulty IS 'Difficulty level: junior, mid, or senior';

-- ============================================
-- Table 4: search_cache
-- Caches web search results to reduce API calls
-- ============================================

CREATE TABLE IF NOT EXISTS search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash VARCHAR(64) UNIQUE NOT NULL,  -- MD5 hash of the search query
  query TEXT NOT NULL,
  results JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- Cache for 7 days
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for cache lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_search_cache_hash ON search_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_cache(expires_at);

COMMENT ON TABLE search_cache IS 'Caches web search results to reduce API calls';
COMMENT ON COLUMN search_cache.query_hash IS 'MD5 hash of query for fast lookup';
COMMENT ON COLUMN search_cache.expires_at IS 'Cache expiration time (7 days from creation)';

-- ============================================
-- Helper Functions
-- ============================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for interview_prep_sessions
DROP TRIGGER IF EXISTS update_sessions_updated_at ON interview_prep_sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON interview_prep_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired search cache (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM search_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_cache IS 'Deletes expired search cache entries. Returns count of deleted rows.';

-- ============================================
-- Verification Queries
-- ============================================

-- Run these to verify tables were created successfully:

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'interview_%'
ORDER BY table_name;

-- Count tables (should return 4)
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'interview_prep_sessions',
    'interview_insights',
    'interview_questions',
    'search_cache'
);

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📊 Tables: interview_prep_sessions, interview_insights, interview_questions, search_cache';
    RAISE NOTICE '🔧 Triggers and functions created';
END $$;
