import React from 'react'
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface BarChartProps {
  data: Array<{ name: string; value: number; category: string }>
  index: string
  categories: string[]
  colors: string[]
  valueFormatter?: (value: number) => string // Add this prop
  yAxisWidth: number
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  yAxisWidth,
}) => {
  // Use valueFormatter in your rendering logic if provided
  const formattedData = data.map((item) => ({
    name: item.name,
    value: item.value,
    category: item.category,
  }))
  return (
    <div>
      <RechartsBarChart width={730} height={250} data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {categories.map((category, index) => (
          <Bar key={category} dataKey="value" fill={colors[index]} />
        ))}
      </RechartsBarChart>
    </div>
  )
}

export default BarChart
