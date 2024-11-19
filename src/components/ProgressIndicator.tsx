import React from 'react';
import { ProcessingStatus } from '../types';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ProgressIndicatorProps {
  status: ProcessingStatus;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
}) => {
  const progress =
    status.total > 0 ? (status.processed / status.total) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Processing files... {Math.round(progress)}%</span>
        <span>{status?.currentFile}</span>
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            {status.successful} successful
          </span>
          <span className="flex items-center">
            <XCircle className="w-4 h-4 text-red-500 mr-1" />
            {status.failed} failed
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 flex"
          style={{ width: '100%' }}
        >
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${(status.successful / status.total) * 100}%` }}
          />
          <div
            className="bg-red-500 h-full transition-all duration-300"
            style={{ width: `${(status.failed / status.total) * 100}%` }}
          />
        </div>
      </div>

      {status.currentFile && (
        <div className="text-sm text-gray-600">
          Current file: {status.currentFile}
        </div>
      )}

      {status.skippedFiles.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-md">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
            <span className="font-medium">
              Skipped Files ({status.skippedFiles.length})
            </span>
          </div>
          <ul className="text-sm text-gray-600 max-h-32 overflow-y-auto">
            {status.skippedFiles.map((file, index) => (
              <li key={index} className="truncate">
                • {file}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
