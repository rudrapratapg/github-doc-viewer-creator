import React, { useState } from 'react';
import { ParsedGitHubUrl, ProcessingStatus } from './types';
import { parseGitHubUrl, fetchAllDocs } from './utils/github';
import { UrlInput } from './components/UrlInput';
import { DocumentViewer } from './components/DocumentViewer';
import { ProgressIndicator } from './components/ProgressIndicator';
import { GithubIcon, Download } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<ParsedGitHubUrl | null>(null);
  const [compiledContent, setCompiledContent] = useState<string>('');
  const [status, setStatus] = useState<ProcessingStatus>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skippedFiles: []
  });

  const handleUrlSubmit = async (url: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setStatus({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        skippedFiles: []
      });
      
      const parsedUrl = parseGitHubUrl(url);
      setCurrentUrl(parsedUrl);
      
      const result = await fetchAllDocs(
        parsedUrl.owner,
        parsedUrl.repo,
        parsedUrl.path,
        (newStatus) => setStatus({ ...newStatus })
      );
      
      setCompiledContent(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([compiledContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GithubIcon className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-gray-900">GitHub Docs Compiler</h1>
            </div>
            {(compiledContent || (isLoading && status.successful > 0)) && (
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                {isLoading ? 'Download Partial Docs' : 'Download Complete Docs'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <UrlInput onSubmit={handleUrlSubmit} isLoading={isLoading} />

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isLoading && <ProgressIndicator status={status} />}

          {compiledContent && !isLoading && (
            <DocumentViewer content={compiledContent} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;