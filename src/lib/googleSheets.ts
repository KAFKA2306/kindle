import { Book } from '@/types/book';
import { toast } from '@/components/ui/use-toast';
import { fallbackBooks } from '@/data/fallbackBooks';

const SPREADSHEET_ID = '1D0AQcFWpYuJs-WJWEc07V4uxqcHVP0LuKa2bMeuJ92w';
const RANGE = 'Sheet1!A2:G';

export async function fetchBookData(): Promise<Book[]> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  
  if (!apiKey || apiKey === 'your_google_api_key_here') {
    toast({
      title: "API キーエラー",
      description: "Google Sheets APIの取得に失敗しました。ローカルデータを使用します。",
    });
    return fallbackBooks;
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${apiKey}`
    );
    
    const data = await response.json();

    if (data.error) {
      toast({
        title: "APIエラー",
        description: "Google Sheets APIの取得に失敗しました。ローカルデータを使用します。",
      });
      return fallbackBooks;
    }
    
    if (!data.values) {
      toast({
        title: "データなし",
        description: "スプレッドシートのデータ取得に失敗しました。ローカルデータを使用します。",
      });
      return fallbackBooks;
    }

    return data.values.map((row: any[]): Book => ({
      注文日: row[0] || '',
      商品名: row[1] || '',
      読了: Number(row[2]) || 0,
      評価: row[3] ? Number(row[3]) : undefined,
      形式: row[4] || '',
      価格円: row[5] || '',
      メインカテゴリ: row[6] || '',
    }));
  } catch (error) {
    toast({
      title: "エラー",
      description: "データの取得中にエラーが発生しました。ローカルデータを使用します。",
    });
    return fallbackBooks;
  }
}