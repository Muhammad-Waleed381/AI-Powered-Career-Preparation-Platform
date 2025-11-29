/**
 * Job Discovery API Route
 * POST /api/jobs/discover - Discover and match jobs for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProfileByEmail } from '@/lib/resume-db-service';
import { searchJobs, generateSearchKeywords } from '@/lib/job-scraping-service';
import { matchJobsWithProfile } from '@/lib/job-matching-service';
import { UserProfile } from '@/lib/resume-ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, keywords, location, maxResults = 20 } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get user profile from database or localStorage
    console.log('Fetching user profile for:', email);
    let profile = await getProfileByEmail(email);

    // If no profile found, create a minimal profile from keywords or return error
    if (!profile) {
      if (!keywords || keywords.length === 0) {
        return NextResponse.json(
          { 
            error: 'User profile not found. Please upload your resume first, or provide search keywords.',
            hint: 'You can provide keywords in the request body to search without a profile.'
          },
          { status: 404 }
        );
      }
      
      // If keywords are provided, create a minimal profile for matching
      profile = {
        email,
        full_name: email.split('@')[0],
        phone: '',
        location: location || '',
        file_name: 'manual_search',
        file_size: 0,
        skills: { 
          technical: keywords, 
          frameworks: [], 
          tools: [], 
          languages: [], 
          soft: [] 
        },
        experience: [],
        education: [],
        certifications: [],
        projects: [],
        skill_proficiency: [],
        top_strengths: keywords,
        experience_level: 'mid',
        total_years_experience: 0,
        summary: '',
      };
    }

    // Convert database profile to UserProfile format
    const userProfile: UserProfile = {
      personalInfo: {
        name: profile.full_name,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        linkedin: profile.linkedin_url,
        github: profile.github_url,
        portfolio: profile.portfolio_url,
      },
      summary: profile.summary || '',
      skills: profile.skills || {
        technical: [],
        languages: [],
        frameworks: [],
        tools: [],
        soft: [],
      },
      experience: profile.experience || [],
      education: profile.education || [],
      certifications: profile.certifications || [],
      projects: profile.projects || [],
    };

    // Generate search keywords from profile or use provided keywords
    const searchKeywords = keywords && keywords.length > 0
      ? keywords
      : generateSearchKeywords({
          skills: userProfile.skills,
          experience: userProfile.experience,
        });

    console.log('Searching jobs with keywords:', searchKeywords);

    // Search for jobs
    const jobs = await searchJobs(searchKeywords, location, maxResults);
    console.log(`Found ${jobs.length} jobs`);

    // Match jobs with user profile
    console.log('Matching jobs with profile...');
    const matchedJobs = await matchJobsWithProfile(userProfile, jobs);
    console.log(`Matched ${matchedJobs.length} jobs`);

    return NextResponse.json({
      success: true,
      jobs: matchedJobs,
      total: matchedJobs.length,
    });
  } catch (error) {
    console.error('Job discovery error:', error);
    return NextResponse.json(
      {
        error: 'Failed to discover jobs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

