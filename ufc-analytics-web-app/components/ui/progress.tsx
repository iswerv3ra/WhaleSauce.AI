import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  return (
    <div className={`relative w-full bg-gray-200 rounded ${className}`}>
      <div
        className="bg-blue-600 h-full rounded"
        style={{ width: `${value}%`, height: '100%' }}
      ></div>
    </div>
  );
};
