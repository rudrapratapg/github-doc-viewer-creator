import { GitHubContent, ProcessingStatus, CompiledDoc } from '../types';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const getHeaders = () => {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  return headers;
};

export const parseGitHubUrl = (url: string) => {
  const regex = /github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error(
      'Invalid GitHub URL format. Please use a URL like: https://github.com/owner/repo/tree/branch/path'
    );
  }

  return {
    owner: match[1],
    repo: match[2],
    branch: match[3],
    path: match[4],
  };
};

const handleGitHubResponse = async (response: Response, path: string) => {
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    console.log('rateLimitRemaining::' + rateLimitRemaining);
    if (rateLimitRemaining === '0') {
      throw new Error(
        'GitHub API rate limit exceeded. Please try again later or provide a GitHub token.'
      );
    }
  }

  if (response.status === 404) {
    throw new Error(`Path not found: ${path}`);
  }

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};

export const fetchAllDocs = async (
  owner: string,
  repo: string,
  path: string,
  onProgress: (status: ProcessingStatus) => void
): Promise<CompiledDoc> => {
  const status: ProcessingStatus = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skippedFiles: [],
  };

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    const response = await fetch(apiUrl, { headers: getHeaders() });
    // console.log("response: ", response);
    const contents: GitHubContent[] = await handleGitHubResponse(
      response,
      path
    );

    // First pass: count total files
    await countTotalFiles(contents, owner, repo, status);
    onProgress(status);

    // Second pass: process files
    const processedDocs = await processDirectory(
      contents,
      owner,
      repo,
      status,
      onProgress
    );

    if (status.successful === 0) {
      throw new Error('No documentation files found in the specified path.');
    }

    return {
      content: compileDocsContent(processedDocs, status.skippedFiles),
      status,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      'An unexpected error occurred while fetching documentation.'
    );
  }
};

async function countTotalFiles(
  contents: GitHubContent[],
  owner: string,
  repo: string,
  status: ProcessingStatus
): Promise<void> {
  for (const item of contents) {
    if (item.type === 'dir') {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`;
      console.log('apiUrl: ' + apiUrl);
      try {
        const response = await fetch(apiUrl, { headers: getHeaders() });
        const dirContents: GitHubContent[] = await handleGitHubResponse(
          response,
          item.path
        );
        await countTotalFiles(dirContents, owner, repo, status);
      } catch (error) {
        console.warn(`Failed to count files in directory: ${item.path}`);
      }
    } else if (isDocFile(item.name)) {
      status.total++;
    }
  }
}

async function processDirectory(
  contents: GitHubContent[],
  owner: string,
  repo: string,
  status: ProcessingStatus,
  onProgress: (status: ProcessingStatus) => void
): Promise<GitHubContent[]> {
  const processedDocs: GitHubContent[] = [];

  for (const item of contents) {
    if (item.type === 'dir') {
      try {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`;
        const response = await fetch(apiUrl, { headers: getHeaders() });
        console.log('Looking into: ' + item.path);
        const dirContents: GitHubContent[] = await handleGitHubResponse(
          response,
          item.path
        );
        const nestedDocs = await processDirectory(
          dirContents,
          owner,
          repo,
          status,
          onProgress
        );
        processedDocs.push(...nestedDocs);
      } catch (error) {
        console.warn(`Error processing directory: ${item.path}`, error);
      }
    } else if (isDocFile(item.name)) {
      status.currentFile = item.path;
      console.log('Current file: ' + status.currentFile);
      onProgress(status);

      try {
        const fileResponse = await fetch(item.url, { headers: getHeaders() });
        const fileData = await handleGitHubResponse(fileResponse, item.path);
        processedDocs.push(fileData);
        status.successful++;
      } catch (error) {
        status.skippedFiles.push(item.path);
        status.failed++;
        console.warn(`Failed to fetch file: ${item.path}`, error);
      }

      status.processed++;
      onProgress(status);
    }
  }

  return processedDocs;
}

export const isDocFile = (filename: string): boolean => {
  const docExtensions = ['.md', '.mdx', '.txt', '.doc', '.docx'];
  return docExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
};

export const compileDocsContent = (
  files: GitHubContent[],
  skippedFiles: string[]
): string => {
  const content = files
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((file) => {
      console.log('File: ' + file);
      const content = file.content ? atob(file.content) : '';
      return `# ${file.path}\n\n${content}\n\n---\n\n`;
    })
    .join('\n');

  if (skippedFiles.length > 0) {
    const skippedSection = `
# Skipped Files

The following files were not processed due to access errors:

${skippedFiles.map((file) => `- ${file}`).join('\n')}

---

`;
    return skippedSection + content;
  }

  return content;
};
