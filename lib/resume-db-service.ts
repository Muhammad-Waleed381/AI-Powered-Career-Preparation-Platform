/**
 * Database Service - Resume Profile Operations
 * CRUD operations for user resume profiles
 * Falls back to localStorage if Supabase is not available
 */

let supabaseClient: any = null;
let supabaseAvailable = false;

// Try to initialize Supabase (only if available)
async function initSupabase() {
  if (supabaseClient !== null) {
    return supabaseClient;
  }

  try {
    const supabaseModule = await import('@supabase/supabase-js');
    const { createClient } = supabaseModule;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      supabaseClient = createClient(supabaseUrl, supabaseKey);
      supabaseAvailable = true;
      return supabaseClient;
    }
  } catch (error) {
    console.warn('Supabase not available, using localStorage fallback');
    supabaseAvailable = false;
  }
  
  return null;
}

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
 * Get profile from localStorage (client-side only)
 */
function getProfileFromStorage(email: string): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(`profile_${email}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return null;
}

/**
 * Save profile to localStorage (client-side only)
 */
function saveProfileToStorage(profile: any): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`profile_${profile.email}`, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Create a new user profile
 */
export async function createProfile(data: ProfileData) {
  const supabase = await initSupabase();
  
  if (supabase && supabaseAvailable) {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw new Error(`Failed to create profile: ${error.message}`);
      }

      // Also save to localStorage as backup
      if (typeof window !== 'undefined') {
        saveProfileToStorage(profile);
      }

      return profile;
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  if (typeof window === 'undefined') {
    throw new Error('Cannot create profile without Supabase on server-side');
  }
  
  const profile = {
    ...data,
    id: `local_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  saveProfileToStorage(profile);
  return profile;
}

/**
 * Get profile by ID
 */
export async function getProfileById(id: string) {
  const supabase = await initSupabase();
  
  if (supabase && supabaseAvailable) {
    try {
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
    } catch (error) {
      console.error('Supabase error:', error);
    }
  }
  
  // Fallback: search localStorage (not ideal for ID lookup, but works)
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('profile_')) {
          const profile = JSON.parse(localStorage.getItem(key) || '{}');
          if (profile.id === id) {
            return profile;
          }
        }
      }
    } catch (error) {
      console.error('Error searching localStorage:', error);
    }
  }
  
  return null;
}

/**
 * Get all profiles for a user
 */
export async function getProfilesByUserId(userId: string) {
  const supabase = await initSupabase();
  
  if (supabase && supabaseAvailable) {
    try {
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
    } catch (error) {
      console.error('Supabase error:', error);
    }
  }
  
  return [];
}

/**
 * Get profile by email
 */
export async function getProfileByEmail(email: string) {
  const supabase = await initSupabase();
  
  if (supabase && supabaseAvailable) {
    try {
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

      if (profile) {
        // Also save to localStorage as backup
        if (typeof window !== 'undefined') {
          saveProfileToStorage(profile);
        }
        return profile;
      }
    } catch (error) {
      console.error('Supabase error, falling back to localStorage:', error);
    }
  }
  
  // Fallback to localStorage
  return getProfileFromStorage(email);
}

/**
 * Update an existing profile
 */
export async function updateProfile(id: string, data: Partial<ProfileData>) {
  const supabase = await initSupabase();
  
  if (supabase && supabaseAvailable) {
    try {
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

      // Also update localStorage
      if (typeof window !== 'undefined' && profile) {
        saveProfileToStorage(profile);
      }

      return profile;
    } catch (error) {
      console.error('Supabase error:', error);
    }
  }
  
  // Fallback: update in localStorage
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('profile_')) {
          const profile = JSON.parse(localStorage.getItem(key) || '{}');
          if (profile.id === id) {
            const updated = { ...profile, ...data, updated_at: new Date().toISOString() };
            localStorage.setItem(key, JSON.stringify(updated));
            return updated;
          }
        }
      }
    } catch (error) {
      console.error('Error updating in localStorage:', error);
    }
  }
  
  throw new Error('Profile not found');
}

/**
 * Delete a profile
 */
export async function deleteProfile(id: string) {
  const supabase = await initSupabase();
  
  if (supabase && supabaseAvailable) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting profile:', error);
        throw new Error(`Failed to delete profile: ${error.message}`);
      }
    } catch (error) {
      console.error('Supabase error:', error);
    }
  }
  
  // Also delete from localStorage
  if (typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('profile_')) {
          const profile = JSON.parse(localStorage.getItem(key) || '{}');
          if (profile.id === id) {
            localStorage.removeItem(key);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  }
  
  return { success: true };
}

/**
 * Get recent profiles (for admin/dashboard)
 */
export async function getRecentProfiles(limit: number = 10) {
  const supabase = await initSupabase();
  
  if (supabase && supabaseAvailable) {
    try {
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
    } catch (error) {
      console.error('Supabase error:', error);
    }
  }
  
  // Fallback: get from localStorage
  if (typeof window !== 'undefined') {
    try {
      const profiles: any[] = [];
      for (let i = 0; i < localStorage.length && profiles.length < limit; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('profile_')) {
          const profile = JSON.parse(localStorage.getItem(key) || '{}');
          profiles.push({
            id: profile.id,
            full_name: profile.full_name,
            email: profile.email,
            experience_level: profile.experience_level,
            top_strengths: profile.top_strengths,
            created_at: profile.created_at,
          });
        }
      }
      return profiles.sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ).slice(0, limit);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
  }
  
  return [];
}
