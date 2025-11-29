/**
 * Resume Profile API
 * Get user profile by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProfileById } from '@/lib/resume-db-service';

/**
 * GET /api/resume/profile/[id]
 * Get a profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const profile = await getProfileById(id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
