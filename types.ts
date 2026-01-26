
export interface Book {
  id: string;
  title: string;
  color: string;
}

export interface DailyStats {
  [date: string]: {
    [bookId: string]: number; // seconds read per book
  };
}

export type ASMRType = 'none' | 'white' | 'brown' | 'pink';
