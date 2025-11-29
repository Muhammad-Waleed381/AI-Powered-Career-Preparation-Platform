/**
 * Database Service - Supabase Integration
 * Handles all database operations for interview prep
 */

import { createClient } from '@supabase/supabase-js';
import type { ResearchResult } from './research-workflow';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client (uses service role key)
const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
};

export interface InterviewSession {
  id: string;
  user_id?: string;
  company_name: string;
  role_name: string;
  technologies: string[];
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

/**
 * Create a new interview prep session
 */
export async function createSession(params: {
  company: string;
  role: string;
  technologies: string[];
  userId?: string;
}): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('interview_prep_sessions')
    .insert({
      company_name: params.company,
      role_name: params.role,
      technologies: params.technologies,
      user_id: params.userId,
      status: 'processing',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return data.id;
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: 'processing' | 'completed' | 'failed'
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('interview_prep_sessions')
    .update({ status })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating session:', error);
    throw new Error(`Failed to update session: ${error.message}`);
  }
}

/**
 * Save research insights to database
 */
export async function saveInsights(
  sessionId: string,
  insights: ResearchResult
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('interview_insights')
    .insert({
      session_id: sessionId,
      company_insights: insights.companyInsights,
      role_insights: insights.roleInsights,
      tech_insights: insights.techInsights,
      preparation_checklist: insights.preparationChecklist,
    });

  if (error) {
    console.error('Error saving insights:', error);
    throw new Error(`Failed to save insights: ${error.message}`);
  }
}

/**
 * Save generated questions to database
 */
export async function saveQuestions(
  sessionId: string,
  questions: Array<{
    question: string;
    question_type: string;
    difficulty: string;
    category: string;
    hints?: string[];
  }>
): Promise<void> {
  const supabase = getSupabaseClient();

  const questionsData = questions.map((q) => ({
    session_id: sessionId,
    question_text: q.question,
    question_type: q.question_type,
    difficulty: q.difficulty,
    category: q.category,
    hints: q.hints || [],
  }));

  const { error } = await supabase
    .from('interview_questions')
    .insert(questionsData);

  if (error) {
    console.error('Error saving questions:', error);
    throw new Error(`Failed to save questions: ${error.message}`);
  }
}

/**
 * Get session with all related data
 */
export async function getSessionById(sessionId: string): Promise<{
  session: InterviewSession;
  insights: any;
  questions: any[];
} | null> {
  const supabase = getSupabaseClient();

  // Get session
  const { data: session, error: sessionError } = await supabase
    .from('interview_prep_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    return null;
  }

  // Get insights
  const { data: insights } = await supabase
    .from('interview_insights')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  // Get questions
  const { data: questions } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  return {
    session,
    insights: insights || null,
    questions: questions || [],
  };
}

/**
 * Get all sessions for a user
 */
export async function getUserSessions(userId: string): Promise<InterviewSession[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('interview_prep_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user sessions:', error);
    return [];
  }

  return data || [];
}

/**
 * Cache search results
 */
export async function cacheSearchResults(
  query: string,
  results: any
): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Create MD5 hash of query
  const crypto = await import('crypto');
  const queryHash = crypto.createHash('md5').update(query).digest('hex');
  
  // Cache for 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error } = await supabase
    .from('search_cache')
    .upsert({
      query_hash: queryHash,
      query,
      results,
      expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'query_hash',
    });

  if (error) {
    // Non-critical error, just log it
    console.warn('Failed to cache search results:', error);
  }
}

/**
 * Get cached search results
 */
export async function getCachedSearchResults(query: string): Promise<any | null> {
  const supabase = getSupabaseClient();
  
  const crypto = await import('crypto');
  const queryHash = crypto.createHash('md5').update(query).digest('hex');

  const { data, error } = await supabase
    .from('search_cache')
    .select('results, expires_at')
    .eq('query_hash', queryHash)
    .single();

  if (error || !data) {
    return null;
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data.results;
}
