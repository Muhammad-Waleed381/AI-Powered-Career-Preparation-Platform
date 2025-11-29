/**
 * Resume Upload API
 * Handles PDF resume uploads and extracts structured profile data
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF, validatePDFFile, preprocessText } from '@/lib/pdf-service';
import { extractProfile, analyzeProficiency } from '@/lib/resume-ai-service';
import { createProfile } from '@/lib/resume-db-service';

/**
 * POST /api/resume/upload
 * Upload and parse a resume PDF
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validatePDFFile({
      mimetype: file.type,
      size: file.size,
      originalFilename: file.name,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    console.log('📄 Processing resume:', file.name);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from PDF
    console.log('📝 Extracting text from PDF...');
    const extraction = await extractTextFromPDF(buffer);

    if (extraction.error || !extraction.text) {
      return NextResponse.json(
        { error: extraction.error || 'Failed to extract text from PDF' },
        { status: 500 }
      );
    }

    // Preprocess text
    const cleanedText = preprocessText(extraction.text);
    console.log(`✅ Extracted ${cleanedText.length} characters from ${extraction.pages} pages`);

    // Extract structured profile using AI
    console.log('🤖 Extracting structured profile with AI...');
    const profile = await extractProfile(cleanedText);
    console.log('✅ Profile extracted successfully');

    // Analyze skill proficiency
    console.log('📊 Analyzing skill proficiency...');
    const proficiency = await analyzeProficiency(profile);
    console.log('✅ Proficiency analysis complete');

    // Prepare data for database
    const profileData = {
      file_name: file.name,
      file_size: file.size,
      full_name: profile.personalInfo.name,
      email: profile.personalInfo.email,
      phone: profile.personalInfo.phone,
      location: profile.personalInfo.location,
      linkedin_url: profile.personalInfo.linkedin || undefined,
      github_url: profile.personalInfo.github || undefined,
      portfolio_url: profile.personalInfo.portfolio || undefined,
      summary: profile.summary,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education,
      certifications: profile.certifications || [],
      projects: profile.projects || [],
      skill_proficiency: proficiency.skillProficiency,
      top_strengths: proficiency.topStrengths,
      experience_level: proficiency.experienceLevel,
      total_years_experience: proficiency.totalYearsExperience,
    };

    // Save to database
    console.log('💾 Saving profile to database...');
    const savedProfile = await createProfile(profileData);
    console.log('✅ Profile saved with ID:', savedProfile.id);

    // Return success response
    return NextResponse.json({
      success: true,
      profileId: savedProfile.id,
      profile: {
        id: savedProfile.id,
        personalInfo: profile.personalInfo,
        summary: profile.summary,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        certifications: profile.certifications,
        projects: profile.projects,
        analysis: {
          skillProficiency: proficiency.skillProficiency,
          topStrengths: proficiency.topStrengths,
          experienceLevel: proficiency.experienceLevel,
          totalYearsExperience: proficiency.totalYearsExperience,
        },
      },
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process resume',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/resume/upload
 * Returns API status
 */
export async function GET() {
  return NextResponse.json({
    status: 'Resume Upload API is running',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /api/resume/upload - Upload and parse a resume PDF',
    },
  });
}
