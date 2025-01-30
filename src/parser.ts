import { CodeReviewComments } from './interfaces';

export function parseAiResponse(jsonString: string): CodeReviewComments {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Basic validation
    const requiredKeys = [
      'readability_comments', 'functionality_comments', 'style_comments',
      'efficiency_comments', 'error_handling_comments', 'security_comments',
      'modularity_comments', 'general_feedback'
    ];

    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        throw new Error(`Missing required key: ${key}`);
      }
    }

    return parsed as CodeReviewComments;
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 