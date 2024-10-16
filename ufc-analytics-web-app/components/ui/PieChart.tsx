// PieChart.tsx
import React from 'react';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  category: string;
  index: string;
  valueFormatter?: (value: number) => string; // Add this prop
  colors: string[];
}

const PieChart: React.FC<PieChartProps> = ({ data, category, index, valueFormatter, colors }) => {
  // Use valueFormatter in your rendering logic if provided
  return (
    <div>
      {/* Chart rendering logic */}
    </div>
  );
};

export default PieChart;
