import React from 'react';
import { Book, BookOpen, DollarSign, Star } from 'lucide-react';
import { StatCard } from './stats/StatCard';
import { MonthlyTrends } from './charts/MonthlyTrends';
import { CategoryDistribution } from './charts/CategoryDistribution';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Book as BookType, MonthlyStats, CategoryStats } from '@/types/book';
import { useQuery } from '@tanstack/react-query';
import { fetchBookData } from '@/lib/googleSheets';

export const BookAnalytics = () => {
  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBookData,
  });

  const processedData = React.useMemo(() => {
    const monthlyStats = books.reduce<Record<string, MonthlyStats>>((acc, book) => {
      const date = new Date(book.注文日);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          count: 0,
          totalPrice: 0,
          readCount: 0,
          totalRating: 0,
          ratingCount: 0,
          avgPrice: 0,
          readRatio: 0,
          avgRating: 0
        };
      }
      
      acc[monthKey].count += 1;
      acc[monthKey].totalPrice += parseFloat(book.価格円?.replace(/,/g, '') || '0');
      if (book.読了 > 0) acc[monthKey].readCount += 1;
      if (book.評価) {
        acc[monthKey].totalRating += book.評価;
        acc[monthKey].ratingCount += 1;
      }
      
      acc[monthKey].avgPrice = acc[monthKey].totalPrice / acc[monthKey].count;
      acc[monthKey].readRatio = acc[monthKey].readCount / acc[monthKey].count;
      acc[monthKey].avgRating = acc[monthKey].ratingCount ? 
        acc[monthKey].totalRating / acc[monthKey].ratingCount : 0;
      
      return acc;
    }, {});

    return Object.values(monthlyStats);
  }, [books]);

  const categoryStats = React.useMemo(() => {
    return Object.values(books.reduce<Record<string, CategoryStats>>((acc, book) => {
      const category = book.メインカテゴリ;
      if (!acc[category]) {
        acc[category] = { name: category, count: 0, totalPrice: 0 };
      }
      acc[category].count += 1;
      acc[category].totalPrice += parseFloat(book.価格円?.replace(/,/g, '') || '0');
      return acc;
    }, {}));
  }, [books]);

  const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];

  const totalBooks = books.length;
  const totalRead = books.filter(book => book.読了 > 0).length;
  const averageRating = books.reduce((acc, book) => acc + (book.評価 || 0), 0) / 
    books.filter(book => book.評価).length;
  const totalSpent = books.reduce((acc, book) => 
    acc + parseFloat(book.価格円?.replace(/,/g, '') || '0'), 0);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading data: {error.message}</div>;
  }

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
        <MonthlyTrends data={processedData} />
        <CategoryDistribution data={categoryStats} colors={COLORS} />
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