export interface DormitoryWeekNav {
  st: string;
  ed: string;
  label: string;
}

export interface DormitoryMenuColumn {
  weekday: string;
  date: string;
}

export interface DormitoryMenuRow {
  category: string;
  /** One cell per day (Mon–Sun), may be empty */
  cells: string[];
}

export interface DormitoryMealTimeTable {
  title: string;
  headers: string[];
  /** Each inner array is one table row (all visible cells left-to-right, colspan expanded) */
  rows: string[][];
}

export interface DormitoryMenuPayload {
  weekLabel: string;
  prevWeek: DormitoryWeekNav | null;
  nextWeek: DormitoryWeekNav | null;
  legendText: string;
  caption: string;
  columns: DormitoryMenuColumn[];
  rows: DormitoryMenuRow[];
  mealTimeTables: DormitoryMealTimeTable[];
  sourceUrl: string;
}

export interface DormitoryMenuNav {
  weekLabel: string;
  prevWeek: DormitoryWeekNav | null;
  nextWeek: DormitoryWeekNav | null;
}

export type DormitoryMenuResult =
  | { ok: true; data: DormitoryMenuPayload }
  | { ok: false; error: string; status?: number; nav?: DormitoryMenuNav };
