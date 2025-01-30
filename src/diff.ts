import { CodeSuggestion, ProgrammingLanguage } from './interfaces';
import { queryLLM, streamAiResponse } from './deepseek';

export async function reviewDiff(diff: string, programmingLanguage: ProgrammingLanguage): Promise<string> {
  const prompt = `Review this Git diff for:
1. Code quality issues
2. Possible bugs
3. Style violations

The code is written in ${programmingLanguage}.`;
  
  return queryLLM(prompt, diff);
}

function parseDiffResponse(response: string): CodeSuggestion[] {
  try {
    // Handle potential JSON wrapping
    const jsonString = response.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonString);
    
    // Handle different response formats
    const suggestions = parsed.suggestions || parsed.results || parsed;

    if (!Array.isArray(suggestions)) {
      throw new Error('Expected array of suggestions');
    }

    return suggestions.map(suggestion => {
      const baseSuggestion: CodeSuggestion = {
        line: Number(suggestion.line) || 0,
        message: suggestion.message || 'No message provided',
        severity: isValidSeverity(suggestion.severity) ? suggestion.severity : 'info',
      };

      if (suggestion.suggestedFix) {
        baseSuggestion.suggestedFix = suggestion.suggestedFix;
      }

      return baseSuggestion;
    });
  } catch (error) {
    throw new Error(`Failed to parse diff response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function isValidSeverity(severity: string): severity is CodeSuggestion['severity'] {
  return ['warning', 'error', 'info'].includes(severity);
}