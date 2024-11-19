export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
}

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

export interface ProcessingStatus {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentFile?: string;
  skippedFiles: string[];
}

export interface CompiledDoc {
  content: string;
  status: ProcessingStatus;
}