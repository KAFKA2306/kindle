import { Book } from '@/types/book';
import { toast } from '@/components/ui/use-toast';

const SPREADSHEET_ID = '1D0AQcFWpYuJs-WJWEc07V4uxqcHVP0LuKa2bMeuJ92w';
const RANGE = 'Sheet1!A2:G';

export async function fetchBookData(): Promise<Book[]> {
  if (!import.meta.env.VITE_GOOGLE_API_KEY) {
    toast({
      title: "設定エラー",
      description: "Google Sheets APIキーが設定されていません。",
      variant: "destructive",
    });
    return [];
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.values) {
      toast({
        title: "データなし",
        description: "スプレッドシートにデータが見つかりませんでした。",
      });
      return [];
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
      description: "データの取得中にエラーが発生しました。",
      variant: "destructive",
    });
    console.error('Error fetching book data:', error);
    return [];
  }
}