// BarChart.tsx
import React from 'react';

interface BarChartProps {
  data: Array<{ name: string; wins: number; losses: number; draws: number }>;
  index: string;
  categories: string[];
  colors: string[];
  valueFormatter?: (value: number) => string; // Add this prop
  yAxisWidth: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, index, categories, colors, valueFormatter, yAxisWidth }) => {
  // Use valueFormatter in your rendering logic if provided
  return (
    <div>
      {/* Chart rendering logic */}
    </div>
  );
};

export default BarChart;
