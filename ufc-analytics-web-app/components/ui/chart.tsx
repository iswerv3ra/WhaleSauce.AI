import React from 'react';

interface BarChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
}

export const BarChart: React.FC<BarChartProps> = ({ data, index, categories, colors }) => {
  return <div>Bar Chart Placeholder</div>;
};

interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  colors?: string[];
}

export const PieChart: React.FC<PieChartProps> = ({ data, category, index, colors }) => {
  return <div>Pie Chart Placeholder</div>;
};
