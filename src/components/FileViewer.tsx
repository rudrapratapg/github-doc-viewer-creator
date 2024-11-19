import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { GitHubContent } from '../types';

interface FileViewerProps {
  file: GitHubContent | null;
}

export const FileViewer: React.FC<FileViewerProps> = ({ file }) => {
  if (!file) {
    return null;
  }

  const content = file.content ? atob(file.content) : '';
  const isMarkdown = file.name.endsWith('.md');

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">{file.name}</h2>
      <div className="prose max-w-none">
        {isMarkdown ? (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {content}
          </ReactMarkdown>
        ) : (
          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
            <code>{content}</code>
          </pre>
        )}
      </div>
    </div>
  );
};