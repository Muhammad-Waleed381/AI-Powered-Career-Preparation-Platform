/**
 * Job Matching Service
 * Matches user profiles with job listings using skill-based algorithm
 */

import { UserProfile } from './resume-ai-service';
import { JobListing } from './job-scraping-service';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = 'llama-3.3-70b-versatile';

function getGroqClient() {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }
  return new Groq({ apiKey: GROQ_API_KEY });
}

export interface JobMatch {
  job: JobListing;
  matchScore: number; // 0-100
  explanation: string;
  matchedSkills: string[];
  missingSkills: string[];
  skillBreakdown: {
    skill: string;
    matched: boolean;
    importance: 'high' | 'medium' | 'low';
  }[];
}

/**
 * Match a user profile with job listings
 */
export async function matchJobsWithProfile(
  profile: UserProfile,
  jobs: JobListing[]
): Promise<JobMatch[]> {
  const matches: JobMatch[] = [];

  for (const job of jobs) {
    const match = await calculateJobMatch(profile, job);
    matches.push(match);
  }

  // Sort by match score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Calculate match score between user profile and job
 */
async function calculateJobMatch(
  profile: UserProfile,
  job: JobListing
): Promise<JobMatch> {
  // Extract all user skills
  const userSkills = new Set<string>();
  
  profile.skills.technical.forEach(skill => 
    userSkills.add(skill.toLowerCase().trim())
  );
  profile.skills.frameworks.forEach(framework => 
    userSkills.add(framework.toLowerCase().trim())
  );
  profile.skills.tools.forEach(tool => 
    userSkills.add(tool.toLowerCase().trim())
  );
  
  // Extract skills from experience
  profile.experience.forEach(exp => {
    exp.technologies.forEach(tech => 
      userSkills.add(tech.toLowerCase().trim())
    );
  });

  // Extract job skills
  const jobSkills = job.skills.map(skill => skill.toLowerCase().trim());
  const jobRequirements = job.requirements.map(req => req.toLowerCase());

  // Calculate skill matches
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const skillBreakdown: JobMatch['skillBreakdown'] = [];

  // Check each job skill
  for (const jobSkill of jobSkills) {
    let matched = false;
    let importance: 'high' | 'medium' | 'low' = 'medium';

    // Check for exact match
    if (userSkills.has(jobSkill)) {
      matched = true;
      matchedSkills.push(jobSkill);
      importance = 'high';
    } else {
      // Check for partial match (e.g., "react" matches "React.js")
      for (const userSkill of userSkills) {
        if (
          jobSkill.includes(userSkill) ||
          userSkill.includes(jobSkill) ||
          areSimilarSkills(jobSkill, userSkill)
        ) {
          matched = true;
          matchedSkills.push(jobSkill);
          importance = 'medium';
          break;
        }
      }
    }

    if (!matched) {
      missingSkills.push(jobSkill);
    }

    skillBreakdown.push({
      skill: jobSkill,
      matched,
      importance,
    });
  }

  // Calculate base match score
  const skillMatchRatio = jobSkills.length > 0 
    ? matchedSkills.length / jobSkills.length 
    : 0;

  // Experience level match
  const experienceMatch = calculateExperienceMatch(profile, job);

  // Calculate final score
  const baseScore = skillMatchRatio * 70; // Skills are 70% of the score
  const experienceScore = experienceMatch * 20; // Experience is 20%
  const locationScore = calculateLocationMatch(profile, job) * 10; // Location is 10%

  const matchScore = Math.round(baseScore + experienceScore + locationScore);

  // Generate explanation using AI
  const explanation = await generateMatchExplanation(
    profile,
    job,
    matchedSkills,
    missingSkills,
    matchScore
  );

  return {
    job,
    matchScore,
    explanation,
    matchedSkills,
    missingSkills,
    skillBreakdown,
  };
}

/**
 * Check if two skills are similar
 */
function areSimilarSkills(skill1: string, skill2: string): boolean {
  const normalized1 = skill1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalized2 = skill2.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Exact match after normalization
  if (normalized1 === normalized2) return true;

  // Common variations
  const variations: { [key: string]: string[] } = {
    'js': ['javascript', 'js', 'ecmascript'],
    'react': ['react', 'reactjs', 'react.js'],
    'node': ['node', 'nodejs', 'node.js'],
    'vue': ['vue', 'vuejs', 'vue.js'],
    'angular': ['angular', 'angularjs', 'angular.js'],
    'python': ['python', 'py'],
    'java': ['java', 'javase'],
    'csharp': ['c#', 'csharp', 'dotnet'],
    'typescript': ['typescript', 'ts'],
  };

  for (const [key, variants] of Object.entries(variations)) {
    if (variants.includes(normalized1) && variants.includes(normalized2)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate experience level match
 */
function calculateExperienceMatch(
  profile: UserProfile,
  job: JobListing
): number {
  // Calculate user's total years of experience
  let totalYears = 0;
  profile.experience.forEach(exp => {
    const start = new Date(exp.startDate);
    const end = exp.endDate === 'Present' 
      ? new Date() 
      : new Date(exp.endDate);
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    totalYears += Math.max(0, years);
  });

  // Determine user's level
  let userLevel: 'junior' | 'mid' | 'senior' | 'any';
  if (totalYears < 2) userLevel = 'junior';
  else if (totalYears < 5) userLevel = 'mid';
  else userLevel = 'senior';

  // Match with job requirement
  if (job.experienceLevel === 'any') return 1.0;
  if (job.experienceLevel === userLevel) return 1.0;
  if (
    (job.experienceLevel === 'mid' && userLevel === 'senior') ||
    (job.experienceLevel === 'junior' && (userLevel === 'mid' || userLevel === 'senior'))
  ) return 0.8; // Overqualified but still a match
  if (
    (job.experienceLevel === 'senior' && userLevel === 'mid') ||
    (job.experienceLevel === 'mid' && userLevel === 'junior')
  ) return 0.5; // Underqualified but possible

  return 0.2; // Poor match
}

/**
 * Calculate location match
 */
function calculateLocationMatch(
  profile: UserProfile,
  job: JobListing
): number {
  const userLocation = profile.personalInfo.location?.toLowerCase() || '';
  const jobLocation = job.location?.toLowerCase() || '';

  if (!jobLocation || jobLocation.includes('remote')) return 1.0;
  if (!userLocation) return 0.5;

  // Check for city/state match
  const userParts = userLocation.split(',').map(p => p.trim());
  const jobParts = jobLocation.split(',').map(p => p.trim());

  for (const userPart of userParts) {
    for (const jobPart of jobParts) {
      if (userPart === jobPart) return 1.0;
      if (userPart.includes(jobPart) || jobPart.includes(userPart)) return 0.7;
    }
  }

  return 0.3; // Different locations
}

/**
 * Generate human-readable match explanation
 */
async function generateMatchExplanation(
  profile: UserProfile,
  job: JobListing,
  matchedSkills: string[],
  missingSkills: string[],
  matchScore: number
): Promise<string> {
  const groq = getGroqClient();

  const prompt = `Generate a brief, professional explanation (2-3 sentences) for why this job matches the candidate.

Candidate Skills: ${JSON.stringify(profile.skills)}
Matched Skills: ${matchedSkills.join(', ')}
Missing Skills: ${missingSkills.join(', ')}
Match Score: ${matchScore}%

Job: ${job.title} at ${job.company}
Required Skills: ${job.skills.join(', ')}

Write a concise explanation highlighting:
1. Why this is a good match (matched skills)
2. What might be missing (missing skills)
3. Overall fit assessment

Keep it professional and actionable.`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || 
      `Match score: ${matchScore}%. You have ${matchedSkills.length} of ${job.skills.length} required skills.`;
  } catch (error) {
    console.error('Error generating explanation:', error);
    return `Match score: ${matchScore}%. You have ${matchedSkills.length} of ${job.skills.length} required skills.`;
  }
}

