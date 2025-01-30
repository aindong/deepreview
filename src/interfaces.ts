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

export type ProgrammingLanguage = 'python' | 'javascript' | 'typescript' | 'go' | 'rust' | 'java' | 'csharp' | 'php' | 'ruby' | 'swift' | 'kotlin' | 'c' | 'c++' | 'sql' | 'html' | 'css' | 'json' | 'yaml' | 'xml' | 'markdown' | 'shell' | 'powershell' | 'batch' | 'makefile' | 'dockerfile' | 'yaml' | 'json' | 'xml' | 'markdown' | 'shell' | 'powershell' | 'batch' | 'makefile' | 'dockerfile';

export interface CodeReviewComments {
  readability_comments: string[];
  functionality_comments: string[];
  style_comments: string[];
  efficiency_comments: string[];
  error_handling_comments: string[];
  security_comments: string[];
  modularity_comments: string[];
  general_feedback: string[];
}