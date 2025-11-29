/**
 * Research Workflow - Multi-step AI Interview Preparation
 * Coordinates search, analysis, synthesis, and question generation
 */

import { searchCompanyInfo, searchTechTrends } from './search-service';
import {
  analyzeContent,
  synthesizeResearch,
  generateTechnicalQuestions,
  generateBehavioralQuestions,
} from './ai-service';

export interface ResearchParams {
  company: string;
  role: string;
  technologies: string[];
  userId?: string;
}

export interface ResearchResult {
  companyInsights: {
    culture: string[];
    values: string[];
    practices: string[];
    recentNews: string[];
  };
  roleInsights: {
    keyResponsibilities: string[];
    requiredSkills: string[];
    experienceLevel: string;
    focusAreas: string[];
  };
  techInsights: Array<{
    technology: string;
    recentUpdates: string[];
    bestPractices: string[];
    commonChallenges: string[];
  }>;
  preparationChecklist: {
    priorityTopics: string[];
    studyTimeline: string;
    resources: string[];
  };
  questions: {
    technical: any[];
    behavioral: any[];
  };
}

/**
 * Execute complete interview preparation research workflow
 */
export async function executeResearch(
  params: ResearchParams
): Promise<ResearchResult> {
  console.log('🚀 Starting interview prep research for:', params);

  try {
    // Step 1: Web Search for Company Information
    console.log('📡 Step 1/5: Searching company information...');
    const companyInfo = await searchCompanyInfo(params.company, params.role);
    
    // Step 2: Web Search for Technology Trends
    console.log('🔍 Step 2/5: Researching technology trends...');
    const techInfo = await searchTechTrends(params.technologies);
    
    // Step 3: AI Analysis and Filtering
    console.log('🤖 Step 3/5: Analyzing and filtering content...');
    const companyAnalysis = await analyzeContent(companyInfo, params);
    const techAnalysis = await analyzeContent(techInfo, params);
    
    // Step 4: Synthesize Research into Structured Insights
    console.log('⚡ Step 4/5: Synthesizing insights...');
    const synthesis = await synthesizeResearch({
      company: params.company,
      role: params.role,
      technologies: params.technologies,
      companyInfo: companyAnalysis.insights,
      techInfo: techAnalysis.insights,
    });
    
    // Step 5: Generate Interview Questions
    console.log('💡 Step 5/5: Generating interview questions...');
    const [technicalQuestions, behavioralQuestions] = await Promise.all([
      generateTechnicalQuestions(synthesis.roleInsights, params.technologies),
      generateBehavioralQuestions(synthesis.companyInsights, synthesis.roleInsights),
    ]);

    console.log('✅ Research complete!');
    console.log(`  - ${technicalQuestions.length  } technical questions generated`);
    console.log(`  - ${behavioralQuestions.length} behavioral questions generated`);
    
    return {
      companyInsights: synthesis.companyInsights,
      roleInsights: synthesis.roleInsights,
      techInsights: synthesis.techInsights,
      preparationChecklist: synthesis.preparationChecklist,
      questions: {
        technical: technicalQuestions,
        behavioral: behavioralQuestions,
      },
    };
  } catch (error) {
    console.error('❌ Research workflow error:', error);
    throw error;
  }
}

/**
 * Validate research parameters
 */
export function validateResearchParams(params: Partial<ResearchParams>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!params.company || params.company.trim().length === 0) {
    errors.push('Company name is required');
  }

  if (!params.role || params.role.trim().length === 0) {
    errors.push('Role/position is required');
  }

  if (!params.technologies || params.technologies.length === 0) {
    errors.push('At least one technology is required');
  }

  if (params.technologies && params.technologies.length > 10) {
    errors.push('Maximum 10 technologies allowed');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
