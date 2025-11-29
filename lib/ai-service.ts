/**
 * AI Service - Groq Integration
 * Uses Llama 3.1 70B model via Groq's fast inference platform
 * Free tier with excellent performance
 */

import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = 'llama-3.3-70b-versatile'; // Current free tier model

// Initialize Groq client
function getGroqClient() {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }
  return new Groq({ apiKey: GROQ_API_KEY });
}

export interface AIResponse {
  content: string;
  error?: string;
}

/**
 * Call Groq API
 */
async function callGroq(messages: Array<{role: string; content: string}>): Promise<AIResponse> {
  try {
    const groq = getGroqClient();
    
    const completion = await groq.chat.completions.create({
      model: MODEL_NAME,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 4096,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
    };
  } catch (error) {
    console.error('Groq API Error:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze and filter search results for relevance
 */
export async function analyzeContent(
  searchResults: string,
  context: { company: string; role: string; technologies: string[] }
): Promise<{ relevantPoints: string[]; insights: string }> {
  const response = await callGroq([
    {
      role: 'system',
      content: 'You are an expert career coach analyzing web search results for interview preparation. Extract ONLY relevant, recent, and accurate information. Filter out ads, outdated content, and promotional material.'
    },
    {
      role: 'user',
      content: `Company: ${context.company}
Role: ${context.role}
Technologies: ${context.technologies.join(', ')}

Search Results:
${searchResults}

Task:
1. Extract 5-10 key relevant points about the company, role, or technologies
2. Identify recent updates or trends (last 12 months)
3. Note important technical requirements
4. Filter out outdated information

Return ONLY valid JSON (no markdown, no explanations):
{
  "relevantPoints": ["point 1", "point 2", ...],
  "insights": "brief summary"
}`
    }
  ]);

  if (response.error) {
    console.error('Error analyzing content:', response.error);
    return { relevantPoints: [], insights: '' };
  }

  try {
    let jsonText = response.content.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }
    
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      relevantPoints: [response.content.substring(0, 200)],
      insights: 'Analysis completed but formatting error occurred',
    };
  }
}

/**
 * Synthesize research data into structured interview insights
 */
export async function synthesizeResearch(data: {
  company: string;
  role: string;
  technologies: string[];
  companyInfo: string;
  techInfo: string;
}): Promise<{
  companyInsights: any;
  roleInsights: any;
  techInsights: any[];
  preparationChecklist: any;
}> {
  const response = await callGroq([
    {
      role: 'system',
      content: 'You are an expert interview preparation coach. Create comprehensive, actionable interview preparation insights.'
    },
    {
      role: 'user',
      content: `Company: ${data.company}
Role: ${data.role}
Technologies: ${data.technologies.join(', ')}

Company Research:
${data.companyInfo}

Technology Research:
${data.techInfo}

Create a comprehensive interview preparation guide. Return ONLY valid JSON (no markdown):
{
  "companyInsights": {
    "culture": ["value 1", "value 2", "value 3"],
    "values": ["value 1", "value 2", "value 3"],
    "practices": ["practice 1", "practice 2", "practice 3"],
    "recentNews": ["update 1", "update 2", "update 3"]
  },
  "roleInsights": {
    "keyResponsibilities": ["resp 1", "resp 2", "resp 3"],
    "requiredSkills": ["skill 1", "skill 2", "skill 3"],
    "experienceLevel": "mid",
    "focusAreas": ["area 1", "area 2", "area 3"]
  },
  "techInsights": [
    {
      "technology": "${data.technologies[0] || 'JavaScript'}",
      "recentUpdates": ["update 1", "update 2"],
      "bestPractices": ["practice 1", "practice 2"],
      "commonChallenges": ["challenge 1", "challenge 2"]
    }
  ],
  "preparationChecklist": {
    "priorityTopics": ["topic 1", "topic 2", "topic 3"],
    "studyTimeline": "2-3 weeks",
    "resources": ["resource 1", "resource 2"]
  }
}`
    }
  ]);

  if (response.error) {
    throw new Error(`Failed to synthesize research: ${response.error}`);
  }

  try {
    let jsonText = response.content.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error parsing synthesis response:', error);
    throw new Error('Failed to parse AI synthesis response');
  }
}

/**
 * Generate technical interview questions
 */
export async function generateTechnicalQuestions(
  insights: any,
  technologies: string[]
): Promise<any[]> {
  const response = await callGroq([
    {
      role: 'system',
      content: 'You are an expert technical interviewer. Generate realistic, challenging interview questions.'
    },
    {
      role: 'user',
      content: `Technologies: ${technologies.join(', ')}
Role Level: ${insights.experienceLevel || 'mid'}
Focus Areas: ${insights.focusAreas?.join(', ') || 'general'}

Generate 10 technical interview questions. Return ONLY valid JSON array:
[
  {
    "question": "detailed question text",
    "difficulty": "junior|mid|senior",
    "category": "algorithm|system_design|tech_specific|debugging",
    "hints": ["hint 1", "hint 2"]
  }
]

Cover: algorithms, system design, and ${technologies.join(', ')}. Mix difficulty levels.`
    }
  ]);

  if (response.error) {
    throw new Error(`Failed to generate technical questions: ${response.error}`);
  }

  try {
    let jsonText = response.content.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }
    
    const questions = JSON.parse(jsonText);
    return questions.map((q: any) => ({ ...q, question_type: 'technical' }));
  } catch (error) {
    console.error('Error parsing questions:', error);
    return [];
  }
}

/**
 * Generate behavioral interview questions
 */
export async function generateBehavioralQuestions(
  companyInsights: any,
  roleInsights: any
): Promise<any[]> {
  const response = await callGroq([
    {
      role: 'system',
      content: 'You are an expert behavioral interviewer. Generate questions that assess culture fit, leadership, and soft skills.'
    },
    {
      role: 'user',
      content: `Company Values: ${companyInsights.values?.join(', ') || 'innovation, teamwork'}
Company Culture: ${companyInsights.culture?.join(', ') || 'collaborative, fast-paced'}
Role Level: ${roleInsights.experienceLevel || 'mid'}

Generate 6 behavioral interview questions. Return ONLY valid JSON array:
[
  {
    "question": "STAR-format question",
    "difficulty": "junior|mid|senior",
    "category": "culture_fit|leadership|teamwork|problem_solving",
    "hints": ["what they look for", "key points"]
  }
]

Use STAR format. Cover: culture fit, leadership, teamwork, problem-solving.`
    }
  ]);

  if (response.error) {
    throw new Error(`Failed to generate behavioral questions: ${response.error}`);
  }

  try {
    let jsonText = response.content.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }
    
    const questions = JSON.parse(jsonText);
    return questions.map((q: any) => ({ ...q, question_type: 'behavioral' }));
  } catch (error) {
    console.error('Error parsing behavioral questions:', error);
    return [];
  }
}
