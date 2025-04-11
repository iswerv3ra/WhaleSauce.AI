import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  category: string;
  index: string;
  valueFormatter?: (value: number) => string;
  colors: string[];
}

const PieChartComponent: React.FC<PieChartProps> = ({
  data,
  category,
  index,
  valueFormatter,
  colors,
}) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          label={({
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            value,
            index,
          }) => {
            return (valueFormatter ? valueFormatter(value) : value);
          }}
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => (valueFormatter ? valueFormatter(value) : value)}/>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;
