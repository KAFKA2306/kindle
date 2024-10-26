import { google } from '@googleapis/sheets';
import { MonthlyStats, CategoryStats, Book } from '@/types/book';

const SPREADSHEET_ID = '1D0AQcFWpYuJs-WJWEc07V4uxqcHVP0LuKa2bMeuJ92w';
const RANGE = 'Sheet1!A2:G'; // Starting from A2 to skip header

const sheets = google.sheets('v4');

export async function fetchBookData(): Promise<Book[]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      key: import.meta.env.VITE_GOOGLE_API_KEY,
    });

    const rows = response.data.values;
    if (!rows) return [];

    return rows.map((row): Book => ({
      注文日: row[0],
      商品名: row[1],
      読了: Number(row[2]),
      評価: row[3] ? Number(row[3]) : undefined,
      形式: row[4],
      価格円: row[5],
      メインカテゴリ: row[6],
    }));
  } catch (error) {
    console.error('Error fetching book data:', error);
    return [];
  }
}