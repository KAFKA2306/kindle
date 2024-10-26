import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CategoryStats } from '@/types/book';

interface CategoryDistributionProps {
  data: CategoryStats[];
  colors: string[];
}

export const CategoryDistribution = ({ data, colors }: CategoryDistributionProps) => (
  <Card>
    <CardHeader>
      <CardTitle>カテゴリー分布</CardTitle>
    </CardHeader>
    <CardContent className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
            label={({ name, percent }) => 
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index % colors.length]} 
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);