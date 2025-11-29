/**
 * Database Service - Resume Profile Operations
 * CRUD operations for user resume profiles
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface ProfileData {
  user_id?: string;
  file_name: string;
  file_size: number;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  summary: string;
  skills: any;
  experience: any[];
  education: any[];
  certifications: any[];
  projects: any[];
  skill_proficiency: any[];
  top_strengths: string[];
  experience_level: string;
  total_years_experience: number;
}

/**
 * Create a new user profile
 */
export async function createProfile(data: ProfileData) {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw new Error(`Failed to create profile: ${error.message}`);
  }

  return profile;
}

/**
 * Get profile by ID
 */
export async function getProfileById(id: string) {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return profile;
}

/**
 * Get all profiles for a user
 */
export async function getProfilesByUserId(userId: string) {
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    throw new Error(`Failed to fetch profiles: ${error.message}`);
  }

  return profiles;
}

/**
 * Get profile by email
 */
export async function getProfileByEmail(email: string) {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching profile by email:', error);
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return profile;
}

/**
 * Update an existing profile
 */
export async function updateProfile(id: string, data: Partial<ProfileData>) {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return profile;
}

/**
 * Delete a profile
 */
export async function deleteProfile(id: string) {
  const { error } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting profile:', error);
    throw new Error(`Failed to delete profile: ${error.message}`);
  }

  return { success: true };
}

/**
 * Get recent profiles (for admin/dashboard)
 */
export async function getRecentProfiles(limit: number = 10) {
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, experience_level, top_strengths, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent profiles:', error);
    throw new Error(`Failed to fetch recent profiles: ${error.message}`);
  }

  return profiles;
}
