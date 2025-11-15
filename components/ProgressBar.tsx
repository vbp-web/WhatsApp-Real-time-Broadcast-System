
import React from 'react';
import type { BroadcastStatus } from '../types';

interface ProgressBarProps {
  progress: number;
  status: BroadcastStatus;
  isBroadcasting: boolean;
  onCancel: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status, isBroadcasting, onCancel }) => {
  const statusText: { [key in BroadcastStatus]: string } = {
    idle: 'Awaiting Broadcast',
    running: 'Broadcast in Progress...',
    completed: 'Broadcast Completed',
    cancelled: 'Broadcast Cancelled',
    error: 'Broadcast Error'
  };

  const statusColor: { [key in BroadcastStatus]: string } = {
    idle: 'bg-gray-500',
    running: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className="mb-4 p-4 bg-gray-700/50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300 capitalize">{statusText[status]}</span>
            <span className="text-sm font-medium text-gray-300">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${statusColor[status]}`}
              style={{ width: `${progress}%` }}
            ></div>
        </div>
        {isBroadcasting && (
          <div className="text-right mt-2">
            <button
              onClick={onCancel}
              className="text-xs text-red-400 hover:text-red-300 hover:underline"
            >
              Cancel Broadcast
            </button>
          </div>
        )}
    </div>
  );
};
