/**
 * PDF Service - Resume PDF Processing
 * Extracts text from PDF resumes for AI analysis
 * Uses pdf2json for server-side PDF text extraction
 */

// Use require for pdf2json (CommonJS module, server-side only)
const PDFParser = require('pdf2json');

export interface PDFExtractionResult {
  text: string;
  pages: number;
  error?: string;
}

/**
 * Extract text from PDF buffer using pdf2json
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<PDFExtractionResult> {
  return new Promise((resolve) => {
    try {
      const pdfParser = new PDFParser(null, 1);
      let extractedText = '';
      let pageCount = 0;

      // Handle text extraction
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('PDF parsing error:', errData);
        resolve({
          text: '',
          pages: 0,
          error: errData.parserError || 'Failed to parse PDF',
        });
      });

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from all pages
          if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
            pageCount = pdfData.Pages.length;
            
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts && Array.isArray(page.Texts)) {
                page.Texts.forEach((textItem: any) => {
                  if (textItem.R && Array.isArray(textItem.R)) {
                    textItem.R.forEach((run: any) => {
                      if (run.T) {
                        // Decode URI component if needed
                        try {
                          extractedText += decodeURIComponent(run.T) + ' ';
                        } catch {
                          extractedText += run.T + ' ';
                        }
                      }
                    });
                  }
                });
                extractedText += '\n\n'; // Add page break
              }
            });
          }

          resolve({
            text: extractedText.trim(),
            pages: pageCount,
          });
        } catch (error) {
          console.error('Error processing PDF data:', error);
          resolve({
            text: '',
            pages: 0,
            error: error instanceof Error ? error.message : 'Failed to process PDF data',
          });
        }
      });

      // Parse the PDF buffer
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      console.error('PDF extraction error:', error);
      resolve({
        text: '',
        pages: 0,
        error: error instanceof Error ? error.message : 'PDF extraction failed',
      });
    }
  });
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
