export interface Book {
  注文日: string;
  商品名: string;
  読了: number;
  評価?: number;
  形式: string;
  価格円?: string;
  メインカテゴリ: string;
}

export interface MonthlyStats {
  month: string;
  count: number;
  totalPrice: number;
  readCount: number;
  totalRating: number;
  ratingCount: number;
  avgPrice: number;
  readRatio: number;
  avgRating: number;
}

export interface CategoryStats {
  name: string;
  count: number;
  totalPrice: number;
}