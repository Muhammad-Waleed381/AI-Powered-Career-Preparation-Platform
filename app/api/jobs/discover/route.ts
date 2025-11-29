/**
 * Job Discovery API Route
 * POST /api/jobs/discover - Discover and match jobs for a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProfileByEmail } from '@/lib/resume-db-service';
import { searchJobs, generateSearchKeywords, generateBroadSearchQueries } from '@/lib/job-scraping-service';
import { matchJobsWithProfile } from '@/lib/job-matching-service';
import { UserProfile } from '@/lib/resume-ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, profile: profileData, keywords, location, maxResults = 20 } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use profile from request body if provided, otherwise fetch from database
    console.log('🔍 Fetching user profile for:', email);
    console.log('📦 Profile data in request:', profileData ? '✅ Provided' : '❌ Not provided');
    
    let profile = profileData;

    // If profile not provided in request, try to get from database
    if (!profile) {
      console.log('📡 Profile not in request, fetching from database...');
      profile = await getProfileByEmail(email);
      console.log('💾 Database profile:', profile ? '✅ Found' : '❌ Not found');
    } else {
      console.log('✅ Using profile from request body');
      console.log('📊 Profile summary:', {
        email: profile.email,
        name: profile.full_name,
        skills_technical: profile.skills?.technical?.length || 0,
        skills_frameworks: profile.skills?.frameworks?.length || 0,
        skills_tools: profile.skills?.tools?.length || 0,
        experience: profile.experience?.length || 0,
        education: profile.education?.length || 0,
        top_strengths: profile.top_strengths?.length || 0,
      });
    }

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

    // Convert database profile to UserProfile format (with null safety)
    const userProfile: UserProfile = {
      personalInfo: {
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        linkedin: profile.linkedin_url || undefined,
        github: profile.github_url || undefined,
        portfolio: profile.portfolio_url || undefined,
      },
      summary: profile.summary || '',
      skills: {
        technical: Array.isArray(profile.skills?.technical) ? profile.skills.technical : [],
        languages: Array.isArray(profile.skills?.languages) ? profile.skills.languages : [],
        frameworks: Array.isArray(profile.skills?.frameworks) ? profile.skills.frameworks : [],
        tools: Array.isArray(profile.skills?.tools) ? profile.skills.tools : [],
        soft: Array.isArray(profile.skills?.soft) ? profile.skills.soft : [],
      },
      experience: Array.isArray(profile.experience) ? profile.experience.map((exp: any) => ({
        ...exp,
        technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
        responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
      })) : [],
      education: Array.isArray(profile.education) ? profile.education : [],
      certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
      projects: Array.isArray(profile.projects) ? profile.projects : [],
    };

    // Generate search keywords from profile or use provided keywords
    let searchKeywords: string[] = [];
    
    if (keywords && keywords.length > 0) {
      searchKeywords = keywords;
      console.log('Using provided keywords:', searchKeywords);
    } else {
      // Generate from profile
      const technicalSkills = userProfile.skills?.technical || [];
      const frameworks = userProfile.skills?.frameworks || [];
      const tools = userProfile.skills?.tools || [];
      
      const experienceArray = Array.isArray(userProfile.experience) ? userProfile.experience : [];
      
      if (technicalSkills.length > 0 || frameworks.length > 0 || tools.length > 0 || experienceArray.length > 0) {
        searchKeywords = generateSearchKeywords({
          skills: {
            technical: Array.isArray(userProfile.skills?.technical) ? userProfile.skills.technical : [],
            frameworks: Array.isArray(userProfile.skills?.frameworks) ? userProfile.skills.frameworks : [],
            tools: Array.isArray(userProfile.skills?.tools) ? userProfile.skills.tools : [],
          },
          experience: experienceArray,
        });
        console.log('Generated keywords from profile:', searchKeywords);
      } else {
        // Fallback: use top strengths or create basic keywords
        if (profile.top_strengths && profile.top_strengths.length > 0) {
          searchKeywords = profile.top_strengths.slice(0, 5);
          console.log('Using top strengths as keywords:', searchKeywords);
        } else {
          // Last resort: use experience level and generic terms
          const level = profile.experience_level || 'mid';
          searchKeywords = [`${level} level developer`, 'software engineer', 'developer'];
          console.log('Using fallback keywords:', searchKeywords);
        }
      }
    }

    if (searchKeywords.length === 0) {
      return NextResponse.json(
        {
          error: 'Unable to generate search keywords. Please provide keywords or ensure your profile has skills/experience.',
          hint: 'You can provide keywords in the request body, or upload a resume with skills and experience.',
        },
        { status: 400 }
      );
    }

    console.log('Searching jobs with keywords:', searchKeywords);
    console.log(`Using broad search strategy to find more jobs (target: ${maxResults})`);

    // Search for jobs with increased maxResults for broader coverage
    // Request more jobs since we're doing multiple searches
    const broadMaxResults = Math.max(maxResults * 2, 50); // Get more jobs for broader coverage
    let jobs = [];
    try {
      jobs = await searchJobs(searchKeywords, location, broadMaxResults);
      console.log(`Found ${jobs.length} jobs using broad search strategy`);
      
      // If no jobs found, return empty array with a helpful message
      if (jobs.length === 0) {
        console.log('No jobs found - returning empty result');
        return NextResponse.json({
          success: true,
          jobs: [],
          total: 0,
          message: 'No jobs found for the given criteria. Try adjusting your search keywords or location.',
        });
      }
    } catch (searchError) {
      console.error('Job search error:', searchError);
      const errorMessage = searchError instanceof Error ? searchError.message : 'Unknown error';
      
      if (errorMessage.includes('SERP_API_KEY')) {
        return NextResponse.json(
          {
            error: 'Job search service is not configured. Please contact support.',
            details: 'SERP_API_KEY is missing',
          },
          { status: 503 }
        );
      }
      
      // For other errors, return empty result instead of failing
      console.warn('Job search failed, returning empty result:', errorMessage);
      return NextResponse.json({
        success: true,
        jobs: [],
        total: 0,
        message: 'Unable to search jobs at this time. Please try again later or use manual keywords.',
      });
    }

    // Match jobs with user profile
    console.log('Matching jobs with profile...');
    let matchedJobs = [];
    try {
      matchedJobs = await matchJobsWithProfile(userProfile, jobs);
      console.log(`Matched ${matchedJobs.length} jobs`);
    } catch (matchError) {
      console.error('Job matching error:', matchError);
      // If matching fails, return jobs without matching scores
      matchedJobs = jobs.map(job => ({
        job,
        matchScore: 50, // Default score
        explanation: 'Unable to calculate match score',
        matchedSkills: [],
        missingSkills: [],
        skillBreakdown: {},
      }));
    }

    return NextResponse.json({
      success: true,
      jobs: matchedJobs,
      total: matchedJobs.length,
    });
  } catch (error) {
    console.error('Job discovery error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
    });
    
    return NextResponse.json(
      {
        error: 'Failed to discover jobs',
        details: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

