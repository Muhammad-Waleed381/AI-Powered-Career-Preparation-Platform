/**
 * Search Service - Tavily AI Integration
 * Provides web search functionality optimized for AI/RAG applications
 */

import { tavily } from '@tavily/core';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
}

/**
 * Initialize Tavily client
 */
function getTavilyClient() {
  if (!TAVILY_API_KEY) {
    throw new Error('TAVILY_API_KEY is not set in environment variables');
  }
  return tavily({ apiKey: TAVILY_API_KEY });
}

/**
 * Perform web search using Tavily
 */
export async function search(query: string, maxResults: number = 5): Promise<SearchResponse> {
  try {
    const client = getTavilyClient();
    
    const response = await client.search(query, {
      maxResults,
      searchDepth: 'advanced', // Get more comprehensive results
      includeAnswer: false,
      includeRawContent: false,
    });

    const results: SearchResult[] = response.results.map((result: any) => ({
      title: result.title || '',
      url: result.url || '',
      content: result.content || '',
      score: result.score || 0,
    }));

    return {
      results,
      query,
    };
  } catch (error) {
    console.error('Tavily search error:', error);
    throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search for company-specific information
 */
export async function searchCompanyInfo(
  company: string,
  role: string
): Promise<string> {
  const queries = [
    `${company} ${role} interview process`,
    `${company} engineering culture values`,
    `${company} recent news tech updates`,
  ];

  let allContent = '';

  for (const query of queries) {
    try {
      const response = await search(query, 3);
      const content = response.results
        .map(r => `${r.title}\n${r.content}\n---`)
        .join('\n\n');
      allContent += `\n\n## Search: ${query}\n\n${content}`;
    } catch (error) {
      console.error(`Error searching "${query}":`, error);
    }
  }

  return allContent || 'No company information found';
}

/**
 * Search for technology-specific trends and best practices
 */
export async function searchTechTrends(
  technologies: string[]
): Promise<string> {
  let allContent = '';

  for (const tech of technologies.slice(0, 5)) { // Limit to 5 techs to avoid rate limits
    const query = `${tech} latest updates best practices 2024`;
    
    try {
      const response = await search(query, 3);
      const content = response.results
        .map(r => `${r.title}\n${r.content}\n---`)
        .join('\n\n');
      
      allContent += `\n\n## Technology: ${tech}\n\n${content}`;
    } catch (error) {
      console.error(`Error searching "${tech}":`, error);
    }
  }

  return allContent || 'No technology information found';
}

/**
 * Search with caching support
 * Uses MD5 hash of query to cache results for 7 days
 */
export async function searchWithCache(
  query: string,
  maxResults: number = 5
): Promise<SearchResponse> {
  // For now, just perform direct search
  // Cache implementation will be added when database is set up
  return search(query, maxResults);
}
