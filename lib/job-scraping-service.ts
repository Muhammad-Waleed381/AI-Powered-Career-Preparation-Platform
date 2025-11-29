/**
 * Job Scraping Service
 * Scrapes job listings using SerpAPI (Google Jobs API)
 */

import Groq from 'groq-sdk';

const SERP_API_KEY = process.env.SERP_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = 'llama-3.3-70b-versatile';

function getGroqClient() {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }
  return new Groq({ apiKey: GROQ_API_KEY });
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  type: string; // full-time, part-time, contract, etc.
  description: string;
  requirements: string[];
  skills: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'any';
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  url: string; // Primary apply/job URL
  applyUrl?: string; // Direct apply link
  companyUrl?: string; // Company website
  linkedinUrl?: string; // LinkedIn company page
  postedDate?: string;
  source: string; // linkedin, indeed, glassdoor, etc.
}

interface SerpApiJobResult {
  title: string;
  company_name: string;
  location: string;
  via: string;
  description: string;
  thumbnail?: string;
  extensions?: string[];
  job_id?: string;
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
    salary?: string;
  };
  apply_options?: Array<{
    title: string;
    link: string;
  }>;
}

interface SerpApiResponse {
  jobs_results?: SerpApiJobResult[];
  error?: string;
}

/**
 * Search for jobs using SerpAPI Google Jobs
 */
export async function searchJobs(
  keywords: string[],
  location?: string,
  maxResults: number = 20
): Promise<JobListing[]> {
  if (!SERP_API_KEY) {
    throw new Error('SERP_API_KEY is not set in environment variables');
  }

  const allJobs: JobListing[] = [];
  const searchLocation = location || 'United States';
  
  // Generate multiple broad search queries for more results
  const searchQueries = generateBroadSearchQueries(keywords);
  console.log(`Generated ${searchQueries.length} search queries for broader coverage`);
  
  // Search with multiple queries to get more jobs
  const jobsPerQuery = Math.ceil(maxResults / Math.min(searchQueries.length, 5)); // Distribute results across queries
  
  for (let i = 0; i < Math.min(searchQueries.length, 5) && allJobs.length < maxResults; i++) {
    const query = searchQueries[i];
    console.log(`Searching query ${i + 1}/${Math.min(searchQueries.length, 5)}: "${query}"`);
    
    try {
      const jobs = await searchSerpApiJobs(query, searchLocation, jobsPerQuery);
      
      // Process each job result
      for (const serpJob of jobs) {
        try {
          const job = await processSerpApiJob(serpJob);
          if (job) {
            allJobs.push(job);
          }
        } catch (error) {
          console.error('Error processing job:', error);
        }
      }
      
      // Small delay between requests to avoid rate limiting
      if (i < Math.min(searchQueries.length, 5) - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`SerpAPI search error for query "${query}":`, error);
      // Continue with next query instead of failing completely
      continue;
    }
  }

  // Remove duplicates based on title + company
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [`${job.title}-${job.company}`, job])).values()
  );

  console.log(`Found ${uniqueJobs.length} unique jobs from ${allJobs.length} total results`);
  return uniqueJobs.slice(0, maxResults);
}

/**
 * Search jobs using SerpAPI
 */
async function searchSerpApiJobs(
  query: string,
  location: string,
  maxResults: number
): Promise<SerpApiJobResult[]> {
  const baseUrl = 'https://serpapi.com/search.json';
  const params = new URLSearchParams({
    engine: 'google_jobs',
    q: query,
    location: location,
    api_key: SERP_API_KEY!,
    num: Math.min(maxResults, 100).toString(), // SerpAPI allows up to 100
  });

  const url = `${baseUrl}?${params.toString()}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SerpAPI request failed: ${response.status} - ${errorText}`);
  }

  const data: SerpApiResponse = await response.json();
  
  if (data.error) {
    // Handle "no results" error gracefully - return empty array instead of throwing
    if (data.error.includes("hasn't returned any results") || data.error.includes("no results")) {
      console.warn('SerpAPI: No results found for query:', query);
      return [];
    }
    // For other errors, still throw
    throw new Error(`SerpAPI error: ${data.error}`);
  }

  return data.jobs_results || [];
}

/**
 * Process SerpAPI job result into our JobListing format
 */
async function processSerpApiJob(serpJob: SerpApiJobResult): Promise<JobListing | null> {
  // Extract basic info
  const title = serpJob.title || '';
  const company = serpJob.company_name || '';
  const jobLocation = serpJob.location || '';
  const description = serpJob.description || '';
  
  // Determine source from "via" field
  let source = 'other';
  const via = (serpJob.via || '').toLowerCase();
  if (via.includes('linkedin')) source = 'linkedin';
  else if (via.includes('indeed')) source = 'indeed';
  else if (via.includes('glassdoor')) source = 'glassdoor';
  else if (via.includes('monster')) source = 'monster';
  else if (via.includes('ziprecruiter')) source = 'ziprecruiter';
  
  // Extract job type from schedule_type
  const jobType = serpJob.detected_extensions?.schedule_type?.toLowerCase() || 'full-time';
  
  // Extract salary if available
  let salary: JobListing['salary'] | undefined;
  const salaryText = serpJob.detected_extensions?.salary;
  if (salaryText) {
    const salaryMatch = salaryText.match(/(\d[\d,]*)\s*-\s*(\d[\d,]*)/);
    if (salaryMatch) {
      salary = {
        min: parseInt(salaryMatch[1].replace(/,/g, '')),
        max: parseInt(salaryMatch[2].replace(/,/g, '')),
        currency: 'USD',
      };
    }
  }
  
  // Extract posted date
  const postedDate = serpJob.detected_extensions?.posted_at;
  
  // Get apply URL and other links
  const applyUrl = serpJob.apply_options?.[0]?.link || '';
  const primaryUrl = applyUrl || `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + company + ' jobs')}`;
  
  // Generate company-related URLs
  const companySearchQuery = encodeURIComponent(company);
  const companyUrl = `https://www.google.com/search?q=${companySearchQuery}`;
  const linkedinCompanyUrl = `https://www.linkedin.com/search/results/companies/?keywords=${companySearchQuery}`;
  
  // Use AI to extract skills and requirements from description
  const extractedData = await extractJobDetailsWithAI(description, title, company);
  
  return {
    title,
    company,
    location: jobLocation,
    type: jobType,
    description: description.substring(0, 500), // Limit description length
    requirements: extractedData.requirements,
    skills: extractedData.skills,
    experienceLevel: extractedData.experienceLevel,
    salary,
    url: primaryUrl, // Primary job URL
    applyUrl: applyUrl || undefined, // Direct apply link if available
    companyUrl, // Company search URL
    linkedinUrl: linkedinCompanyUrl, // LinkedIn company search
    postedDate,
    source,
  };
}

/**
 * Extract skills and requirements using AI
 */
async function extractJobDetailsWithAI(
  description: string,
  title: string,
  company: string
): Promise<{
  skills: string[];
  requirements: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'any';
}> {
  if (!GROQ_API_KEY) {
    // Fallback: basic extraction without AI
    return {
      skills: extractSkillsBasic(description),
      requirements: [],
      experienceLevel: 'any',
    };
  }

  const groq = getGroqClient();

  const prompt = `Extract structured information from this job description.

Job Title: ${title}
Company: ${company}
Description:
${description.substring(0, 3000)}

Extract and return ONLY valid JSON (no markdown, no explanations):
{
  "skills": ["skill1", "skill2", "skill3", ...],
  "requirements": ["requirement 1", "requirement 2", ...],
  "experienceLevel": "junior" or "mid" or "senior" or "any"
}

Important:
- Extract ALL technical skills (programming languages, frameworks, tools, technologies)
- Extract key requirements from the description
- Determine experience level from keywords like "junior", "senior", "years of experience", etc.
- Return ONLY the JSON object. No markdown formatting.`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    });

    const responseContent = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    let jsonText = responseContent.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    const extracted = JSON.parse(jsonText);
    return {
      skills: extracted.skills || [],
      requirements: extracted.requirements || [],
      experienceLevel: extracted.experienceLevel || 'any',
    };
  } catch (error) {
    console.error('Error extracting job details with AI:', error);
    // Fallback to basic extraction
    return {
      skills: extractSkillsBasic(description),
      requirements: [],
      experienceLevel: 'any',
    };
  }
}

/**
 * Basic skill extraction without AI (fallback)
 */
function extractSkillsBasic(description: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js', 'Django', 'Flask',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'MongoDB', 'PostgreSQL',
    'MySQL', 'Redis', 'GraphQL', 'REST', 'HTML', 'CSS', 'SASS', 'Tailwind',
    'Machine Learning', 'AI', 'Data Science', 'SQL', 'NoSQL', 'Linux', 'Unix',
  ];

  const foundSkills: string[] = [];
  const lowerDescription = description.toLowerCase();

  for (const skill of commonSkills) {
    if (lowerDescription.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }

  return foundSkills;
}

/**
 * Generate search keywords from user profile
 */
export function generateSearchKeywords(profile: {
  skills: {
    technical?: string[] | null;
    frameworks?: string[] | null;
    tools?: string[] | null;
  };
  experience?: Array<{
    title?: string;
    technologies?: string[] | null;
  }> | null;
}): string[] {
  const keywords = new Set<string>();

  // Add technical skills (with null checks)
  if (profile.skills?.technical && Array.isArray(profile.skills.technical)) {
    profile.skills.technical.forEach(skill => {
      if (skill) keywords.add(skill);
    });
  }
  
  if (profile.skills?.frameworks && Array.isArray(profile.skills.frameworks)) {
    profile.skills.frameworks.forEach(framework => {
      if (framework) keywords.add(framework);
    });
  }
  
  if (profile.skills?.tools && Array.isArray(profile.skills.tools)) {
    profile.skills.tools.forEach(tool => {
      if (tool) keywords.add(tool);
    });
  }

  // Add job titles from experience (with null checks)
  if (profile.experience && Array.isArray(profile.experience)) {
    profile.experience.forEach(exp => {
      if (exp?.title) {
        keywords.add(exp.title);
      }
      if (exp?.technologies && Array.isArray(exp.technologies)) {
        exp.technologies.forEach(tech => {
          if (tech) keywords.add(tech);
        });
      }
    });
  }

  // Convert to array - return all keywords for broader search (no limit)
  return Array.from(keywords);
}

/**
 * Generate broad search queries for more job results
 */
export function generateBroadSearchQueries(keywords: string[]): string[] {
  const queries: string[] = [];
  
  if (keywords.length === 0) {
    return ['software engineer', 'developer', 'programmer'];
  }

  // Get primary skills (top 3 most common)
  const primarySkills = keywords.slice(0, 3);
  
  // Strategy 1: Single primary skill + role
  primarySkills.forEach(skill => {
    queries.push(`${skill} developer`);
    queries.push(`${skill} engineer`);
    queries.push(`${skill} programmer`);
  });

  // Strategy 2: General role terms (very broad)
  queries.push('software engineer');
  queries.push('software developer');
  queries.push('programmer');
  queries.push('developer');

  // Strategy 3: Primary skill alone (if it's a common one)
  if (primarySkills.length > 0) {
    queries.push(primarySkills[0]);
  }

  // Strategy 4: Two primary skills combined
  if (primarySkills.length >= 2) {
    queries.push(`${primarySkills[0]} ${primarySkills[1]} developer`);
  }

  return queries;
}
