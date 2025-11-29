/**
 * Resume Profile API
 * Save or update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { createProfile, updateProfile, getProfileByEmail } from '@/lib/resume-db-service';

/**
 * POST /api/cv/profile
 * Save or update a user profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await getProfileByEmail(body.email);

    let profile;
    if (existingProfile && existingProfile.id) {
      // Update existing profile
      profile = await updateProfile(existingProfile.id, body);
    } else {
      // Create new profile
      profile = await createProfile(body);
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to save profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cv/profile
 * Returns API status
 */
export async function GET() {
  return NextResponse.json({
    status: 'Profile API is running',
    version: '1.0.0',
    endpoints: {
      save: 'POST /api/cv/profile - Save or update a user profile',
    },
  });
}

