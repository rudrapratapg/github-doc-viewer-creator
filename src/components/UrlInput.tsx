import React, { useState } from 'react';
import { SearchIcon, AlertTriangle } from 'lucide-react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [showWarning, setShowWarning] = useState(!import.meta.env.VITE_GITHUB_TOKEN);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter GitHub repository URL (e.g., https://github.com/owner/repo/tree/branch/path)"
            className="w-full px-4 py-3 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
        </div>
      </form>

      {showWarning && (
        <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <p>
            No GitHub token found. You may encounter rate limiting. For better results, add a VITE_GITHUB_TOKEN to your environment.
          </p>
        </div>
      )}
    </div>
  );
};