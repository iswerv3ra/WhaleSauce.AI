import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[] | undefined;
}

export const Chart: React.FC<BarChartProps> = ({ data, index, categories, colors }) => {
  return <div style={{ backgroundColor: '#E0EBF5', padding: '20px' }}>
  </div>
};

interface PieChartProps {
  data: any[];
  category: string;
  index: string;
  colors?: string[] | undefined;
}

// export const PieChart: React.FC<PieChartProps> = ({ data, category, index, colors }) => {
//   return <ResponsiveContainer width="100%" height={300}>
//     <PieChart width={400} height={400} >
//       <Pie data={data} dataKey={index} nameKey={category} cx="50%" cy="50%" outerRadius={50} fill="#8884d8" />
//     </PieChart>
//   </ResponsiveContainer>;
// };
