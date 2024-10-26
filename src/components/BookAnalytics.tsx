import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Book, BookOpen, DollarSign, Star, TrendingUp } from 'lucide-react';

const rawData = [
  // ... your data array here (I'll process it in the component)
];

export const BookAnalytics = () => {
  const processedData = useMemo(() => {
    // Group by month and calculate metrics
    const monthlyStats = rawData.reduce((acc, book) => {
      const date = new Date(book.注文日);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          count: 0,
          totalPrice: 0,
          readCount: 0,
          totalRating: 0,
          ratingCount: 0
        };
      }
      
      acc[monthKey].count += 1;
      acc[monthKey].totalPrice += parseFloat(book.価格円?.replace(/,/g, '') || '0');
      if (book.読了 > 0) acc[monthKey].readCount += 1;
      if (book.評価) {
        acc[monthKey].totalRating += parseInt(book.評価);
        acc[monthKey].ratingCount += 1;
      }
      
      return acc;
    }, {});

    return Object.values(monthlyStats).map(stat => ({
      ...stat,
      avgPrice: stat.totalPrice / stat.count,
      readRatio: stat.readCount / stat.count,
      avgRating: stat.ratingCount ? stat.totalRating / stat.ratingCount : 0
    }));
  }, []);

  const categoryStats = useMemo(() => {
    const stats = rawData.reduce((acc, book) => {
      const category = book.メインカテゴリ;
      if (!acc[category]) {
        acc[category] = { name: category, count: 0, totalPrice: 0 };
      }
      acc[category].count += 1;
      acc[category].totalPrice += parseFloat(book.価格円?.replace(/,/g, '') || '0');
      return acc;
    }, {});
    return Object.values(stats);
  }, []);

  const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

  const totalBooks = rawData.length;
  const totalRead = rawData.filter(book => book.読了 > 0).length;
  const averageRating = rawData.reduce((acc, book) => acc + (book.評価 || 0), 0) / 
    rawData.filter(book => book.評価).length;
  const totalSpent = rawData.reduce((acc, book) => 
    acc + parseFloat(book.価格円?.replace(/,/g, '') || '0'), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">読書分析ダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="総書籍数"
          value={totalBooks}
          icon={<Book className="h-5 w-5 text-amber-500" />}
        />
        <StatCard 
          title="読了率"
          value={`${Math.round((totalRead / totalBooks) * 100)}%`}
          icon={<BookOpen className="h-5 w-5 text-emerald-500" />}
        />
        <StatCard 
          title="平均評価"
          value={averageRating.toFixed(1)}
          icon={<Star className="h-5 w-5 text-blue-500" />}
        />
        <StatCard 
          title="総支出"
          value={`¥${totalSpent.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5 text-purple-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月別購入・読了推移</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="count" 
                  stroke="#F59E0B" 
                  name="購入数"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="readRatio" 
                  stroke="#10B981" 
                  name="読了率"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カテゴリー分布</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => 
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {categoryStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>カテゴリー別統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map((category, index) => (
              <div 
                key={category.name}
                className="p-4 rounded-lg bg-muted"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{category.name}</h3>
                  <Badge 
                    variant="secondary"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {category.count}冊
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  平均価格: ¥{Math.round(category.totalPrice / category.count).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => (
  <Card>
    <CardContent className="pt-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </CardContent>
  </Card>
);