/**
 * Resume AI Service - Structured Resume Data Extraction
 * Uses Groq AI to parse resumes into structured profiles
 */

import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = 'llama-3.3-70b-versatile';

function getGroqClient() {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set');
  }
  return new Groq({ apiKey: GROQ_API_KEY });
}

export interface UserProfile {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    technical: string[];
    languages: string[];
    frameworks: string[];
    tools: string[];
    soft: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
    achievements: string[];
    technologies: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa?: string;
    achievements: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
}

export interface ProficiencyAnalysis {
  skillProficiency: Array<{
    skill: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience: number;
    context: string;
  }>;
  topStrengths: string[];
  experienceLevel: 'junior' | 'mid' | 'senior';
  totalYearsExperience: number;
}

/**
 * Extract structured profile from resume text
 */
export async function extractProfile(resumeText: string): Promise<UserProfile> {
  const groq = getGroqClient();

  const prompt = `You are an expert resume parser. Extract structured information from this resume.

Resume Text:
${resumeText.substring(0, 8000)} 

Extract and return ONLY valid JSON (no markdown, no explanations):
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "+1-xxx-xxx-xxxx",
    "location": "City, State/Country",
    "linkedin": "linkedin_url",
    "github": "github_url",
    "portfolio": "portfolio_url"
  },
  "summary": "Professional summary in 2-3 sentences",
  "skills": {
    "technical": ["JavaScript", "Python", ...],
    "languages": ["English", "Spanish", ...],
    "frameworks": ["React", "Node.js", ...],
    "tools": ["Git", "Docker", ...],
    "soft": ["Leadership", "Communication", ...]
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "startDate": "2020-01",
      "endDate": "2023-12" or "Present",
      "responsibilities": ["Developed...", "Led..."],
      "achievements": ["Increased...", "Reduced..."],
      "technologies": ["React", "Node.js"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "institution": "University Name",
      "location": "City, Country",
      "graduationDate": "2020-05",
      "gpa": "3.8/4.0",
      "achievements": ["Dean's List", ...]
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified",
      "issuer": "Amazon",
      "date": "2023-06",
      "url": "credential_url"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["React", "Firebase"],
      "url": "github_url"
    }
  ]
}

Important: Return ONLY the JSON object. No markdown formatting.`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    let jsonText = content.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    const profile = JSON.parse(jsonText);
    return profile;
  } catch (error) {
    console.error('Profile extraction error:', error);
    throw new Error(`Failed to extract profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze skill proficiency based on experience
 */
export async function analyzeProficiency(profile: UserProfile): Promise<ProficiencyAnalysis> {
  const groq = getGroqClient();

  const prompt = `Analyze the skills and experience to determine proficiency levels.

Skills:
${JSON.stringify(profile.skills, null, 2)}

Experience:
${JSON.stringify(profile.experience, null, 2)}

For each technical skill/framework/tool, determine proficiency level based on:
- Years of experience using it
- Complexity of projects
- Context in which it was used

Return ONLY valid JSON (no markdown):
{
  "skillProficiency": [
    {
      "skill": "React",
      "level": "advanced",
      "yearsOfExperience": 3,
      "context": "Used in multiple production projects"
    }
  ],
  "topStrengths": ["skill1", "skill2", "skill3"],
  "experienceLevel": "mid",
  "totalYearsExperience": 5
}

Determine experienceLevel as:
- junior: 0-2 years
- mid: 2-5 years
- senior: 5+ years`;

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    let jsonText = content.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    const analysis = JSON.parse(jsonText);
    return analysis;
  } catch (error) {
    console.error('Proficiency analysis error:', error);
    throw new Error(`Failed to analyze proficiency: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
