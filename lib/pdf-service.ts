/**
 * PDF Service - Resume PDF Processing
 * Extracts text from PDF resumes for AI analysis
 */

import pdf from 'pdf-parse/lib/pdf-parse.js';

export interface PDFExtractionResult {
  text: string;
  pages: number;
  error?: string;
}

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
  try {
    const data = await pdf(buffer);

    return {
      text: data.text,
      pages: data.numpages,
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      text: '',
      pages: 0,
      error: error instanceof Error ? error.message : 'PDF extraction failed',
    };
  }
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: {
  type?: string;
  mimetype?: string;
  size: number;
  name?: string;
  originalFilename?: string;
}): { valid: boolean; error?: string } {
  // Check file type
  const mimeType = file.type || file.mimetype || '';
  const fileName = file.name || file.originalFilename || '';
  
  if (!mimeType.includes('pdf') && !fileName.toLowerCase().endsWith('.pdf')) {
    return {
      valid: false,
      error: 'File must be a PDF',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  // Minimum file size (1KB to avoid empty files)
  if (file.size < 1024) {
    return {
      valid: false,
      error: 'File is too small to be a valid resume',
    };
  }

  return { valid: true };
}

/**
 * Preprocess extracted text
 * Clean up and normalize text for better AI processing
 */
export function preprocessText(text: string): string {
  let cleaned = text;

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Remove excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Trim each line
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .join('\n');

  // Remove common PDF artifacts
  cleaned = cleaned.replace(/\f/g, '\n'); // Form feed
  cleaned = cleaned.replace(/\r/g, ''); // Carriage return

  return cleaned.trim();
}
