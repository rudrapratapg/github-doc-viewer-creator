import React from 'react';
import { FileIcon, FolderIcon } from 'lucide-react';
import { GitHubContent } from '../types';

interface FileExplorerProps {
  contents: GitHubContent[];
  onFileClick: (content: GitHubContent) => void;
  onFolderClick: (content: GitHubContent) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  contents,
  onFileClick,
  onFolderClick,
}) => {
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Repository Contents</h2>
      <div className="space-y-2">
        {contents.map((item) => (
          <button
            key={item.sha}
            onClick={() => item.type === 'file' ? onFileClick(item) : onFolderClick(item)}
            className="w-full flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            {item.type === 'file' ? (
              <FileIcon className="w-5 h-5 mr-2 text-gray-500" />
            ) : (
              <FolderIcon className="w-5 h-5 mr-2 text-blue-500" />
            )}
            <span className="text-sm text-gray-700">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};