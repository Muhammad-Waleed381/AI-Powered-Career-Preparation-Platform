/**
 * Interview Preparation API Route
 * POST /api/interview-prep - Start new research session
 */

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, role, technologies } = body;

    // Validate input
    if (!company || !role || !technologies || technologies.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Starting research for:', { company, role, technologies });

    // Generate comprehensive research using Groq
    const researchPrompt = `You are an expert career advisor and interview coach. Provide detailed interview preparation research for:

Company: ${company}
Role: ${role}
Technologies: ${technologies.join(', ')}

Generate a comprehensive JSON response with the following structure (respond ONLY with valid JSON, no markdown):
{
  "companyInsights": {
    "overview": "Brief company description and what they do",
    "culture": "Company culture, values, and work environment",
    "recentNews": ["Recent news 1", "Recent news 2", "Recent news 3"],
    "interviewProcess": "Description of typical interview process at this company",
    "keyFocusAreas": ["Focus area 1", "Focus area 2", "Focus area 3"]
  },
  "roleInsights": {
    "responsibilities": ["Key responsibility 1", "Key responsibility 2", "Key responsibility 3"],
    "requiredSkills": ["Required skill 1", "Required skill 2", "Required skill 3"],
    "niceToHave": ["Nice to have 1", "Nice to have 2"],
    "careerProgression": "Typical career progression path"
  },
  "techInsights": [
    {
      "name": "Technology name",
      "category": "Category (e.g., Frontend, Backend, Cloud)",
      "description": "What this technology is and why it matters",
      "keyTopics": ["Important topic 1", "Important topic 2", "Important topic 3"],
      "commonPatterns": ["Common pattern 1", "Common pattern 2"],
      "resources": [
        {"title": "Official docs", "url": "https://example.com", "type": "Documentation"},
        {"title": "Tutorial", "url": "https://example.com", "type": "Tutorial"}
      ]
    }
  ],
  "questions": {
    "technical": [
      {
        "question": "Technical interview question",
        "difficulty": "Easy/Medium/Hard",
        "topics": ["Topic 1", "Topic 2"],
        "hints": ["Hint 1", "Hint 2"],
        "sampleAnswer": "Detailed sample answer explaining the solution"
      }
    ],
    "behavioral": [
      {
        "question": "Behavioral interview question",
        "category": "Leadership/Teamwork/Problem-solving/etc",
        "framework": "STAR",
        "hints": ["Hint 1", "Hint 2"],
        "sampleAnswer": "Sample answer using STAR framework"
      }
    ]
  },
  "preparationChecklist": {
    "weeks": [
      {
        "week": 1,
        "focus": "Main focus for this week",
        "tasks": [
          {"task": "Specific task to complete", "completed": false},
          {"task": "Another task", "completed": false}
        ],
        "resources": ["Resource 1", "Resource 2"]
      }
    ],
    "dailyPractice": ["Daily practice item 1", "Daily practice item 2"],
    "finalWeekTips": ["Final week tip 1", "Final week tip 2"]
  }
}

Make the content specific to ${company} and the ${role} role. Include at least 8 technical questions and 8 behavioral questions. For tech insights, provide details for each technology: ${technologies.join(', ')}. Create a 4-week study plan.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert career advisor. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: researchPrompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 8000,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```\s*$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```\s*$/, '');
    }

    const data = JSON.parse(cleanedResponse);

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Research completed successfully!');

    return NextResponse.json({
      success: true,
      sessionId,
      data,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Research failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Interview Preparation API',
    endpoints: {
      POST: '/api/interview-prep - Start new research session',
    },
    status: 'ready',
  });
}
