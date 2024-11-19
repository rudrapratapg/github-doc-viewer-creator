import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface DocumentViewerProps {
  content: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ content }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="prose max-w-none">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};