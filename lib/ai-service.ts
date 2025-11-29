/**
 * AI Service - OpenRouter Integration
 * Uses free Gemini 2.0 Flash model for interview prep analysis
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const FREE_MODEL = 'google/gemini-2.0-flash-exp:free';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

/**
 * Call OpenRouter API with the free Gemini model
 */
async function callOpenRouter(messages: AIMessage[]): Promise<AIResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Career Preparation Platform',
      },
      body: JSON.stringify({
        model: FREE_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
    };
  } catch (error) {
    console.error('OpenRouter API Error:', error);
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
  const systemPrompt = `You are an expert career coach analyzing web search results for interview preparation.
Your task is to extract ONLY relevant, recent, and accurate information.
Filter out: ads, outdated content (>1 year old), irrelevant information, promotional content.`;

  const userPrompt = `Company: ${context.company}
Role: ${context.role}
Technologies: ${context.technologies.join(', ')}

Search Results:
${searchResults}

Task:
1. Extract 5-10 key relevant points about the company, role, or technologies
2. Identify any recent updates or trends (last 12 months)
3. Note any important technical requirements or expectations
4. Filter out outdated or irrelevant information

Return as JSON:
{
  "relevantPoints": ["point 1", "point 2", ...],
  "insights": "brief summary of key findings"
}`;

  const response = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  if (response.error) {
    console.error('Error analyzing content:', response.error);
    return { relevantPoints: [], insights: '' };
  }

  try {
    // Extract JSON from response (handle markdown code blocks if present)
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
      relevantPoints: [response.content],
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
  const systemPrompt = `You are an expert interview preparation coach.
Create comprehensive, actionable interview preparation insights based on research data.`;

  const userPrompt = `Company: ${data.company}
Role: ${data.role}
Technologies: ${data.technologies.join(', ')}

Company Research:
${data.companyInfo}

Technology Research:
${data.techInfo}

Create a comprehensive interview preparation guide as JSON:
{
  "companyInsights": {
    "culture": ["cultural value 1", "cultural value 2", ...],
    "values": ["company value 1", "company value 2", ...],
    "practices": ["engineering practice 1", "practice 2", ...],
    "recentNews": ["recent update 1", "update 2", ...]
  },
  "roleInsights": {
    "keyResponsibilities": ["responsibility 1", "responsibility 2", ...],
    "requiredSkills": ["skill 1", "skill 2", ...],
    "experienceLevel": "junior/mid/senior",
    "focusAreas": ["area 1", "area 2", ...]
  },
  "techInsights": [
    {
      "technology": "tech name",
      "recentUpdates": ["update 1", "update 2"],
      "bestPractices": ["practice 1", "practice 2"],
      "commonChallenges": ["challenge 1", "challenge 2"]
    }
  ],
  "preparationChecklist": {
    "priorityTopics": ["topic 1", "topic 2", ...],
    "studyTimeline": "suggested timeline",
    "resources": ["resource 1", "resource 2", ...]
  }
}`;

  const response = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
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
  const systemPrompt = `You are an expert technical interviewer.
Generate realistic, challenging interview questions based on the role and technologies.
Mix difficulty levels and question types (coding, system design, theoretical).`;

  const userPrompt = `Technologies: ${technologies.join(', ')}
Role Level: ${insights.experienceLevel || 'mid'}
Focus Areas: ${insights.focusAreas?.join(', ') || 'general'}

Generate 10-15 technical interview questions as JSON array:
[
  {
    "question": "detailed question text",
    "difficulty": "junior|mid|senior",
    "category": "algorithm|system_design|tech_specific|debugging",
    "hints": ["hint 1", "hint 2"]
  }
]

Requirements:
- Cover all main technologies
- Mix difficulty levels appropriately
- Include practical scenarios
- Be specific and realistic`;

  const response = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
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
  const systemPrompt = `You are an expert behavioral interviewer.
Generate questions that assess culture fit, leadership, teamwork, and soft skills.`;

  const userPrompt = `Company Values: ${companyInsights.values?.join(', ') || 'innovation, teamwork'}
Company Culture: ${companyInsights.culture?.join(', ') || 'collaborative, fast-paced'}
Role Level: ${roleInsights.experienceLevel || 'mid'}

Generate 5-8 behavioral interview questions as JSON array:
[
  {
    "question": "detailed STAR-format question",
    "difficulty": "junior|mid|senior",
    "category": "culture_fit|leadership|teamwork|problem_solving",
    "hints": ["what they're looking for", "key points to mention"]
  }
]

Requirements:
- Align with company values
- Use STAR format prompts
- Cover different competencies
- Be realistic and specific`;

  const response = await callOpenRouter([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
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
