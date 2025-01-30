export interface CodeSuggestion {
  line: number;
  message: string;
  suggestedFix?: string;
  severity: 'warning' | 'error' | 'info';
}

export interface CodeAnalysisResult {
  filePath: string;
  suggestions: CodeSuggestion[];
}