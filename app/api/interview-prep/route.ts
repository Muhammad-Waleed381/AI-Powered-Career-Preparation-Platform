/**
 * Interview Preparation API Route
 * POST /api/interview-prep - Start new research session
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeResearch, validateResearchParams } from '@/lib/research-workflow';
import {
  createSession,
  saveInsights,
  saveQuestions,
  updateSessionStatus,
} from '@/lib/db-service';

export async function POST(request: NextRequest) {
  let sessionId: string | null = null;

  try {
    const body = await request.json();
    const { company, role, technologies } = body;

    // Validate input params
    const validation = validateResearchParams({ company, role, technologies });
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Create session in database
    console.log('Creating database session...');
    sessionId = await createSession({ company, role, technologies });
    console.log('Session created:', sessionId);

    // Execute research workflow
    console.log('Starting research for:', { company, role, technologies });
    const result = await executeResearch({
      company,
      role,
      technologies,
    });

    // Save insights to database
    console.log('Saving insights to database...');
    await saveInsights(sessionId, result);

    // Save questions to database
    console.log('Saving questions to database...');
    const allQuestions = [
      ...result.questions.technical,
      ...result.questions.behavioral,
    ];
    await saveQuestions(sessionId, allQuestions);

    // Update session status to completed
    await updateSessionStatus(sessionId, 'completed');
    console.log('Research completed and saved!');

    return NextResponse.json({
      success: true,
      sessionId,
      data: result,
    });
  } catch (error) {
    console.error('API Error:', error);

    // Mark session as failed if it was created
    if (sessionId) {
      try {
        await updateSessionStatus(sessionId, 'failed');
      } catch (updateError) {
        console.error('Failed to update session status:', updateError);
      }
    }

    return NextResponse.json(
      {
        error: 'Research failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        sessionId,
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
