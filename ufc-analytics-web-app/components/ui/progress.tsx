import React from 'react';

interface ProgressProps {
  value: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  const progressColor = "#4B75B7"
  return (
    <div className={`relative w-full bg-[#E0EBF5] rounded ${className}`}>
      <div
        className={`h-full rounded`} style={{ width: `${value}%`, height: '100%', backgroundColor: progressColor}}
      ></div>
    </div>
  );
};
