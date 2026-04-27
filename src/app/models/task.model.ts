export interface Task {
  id: string;
  title: string;
  columnId: string;
  timeSpent: Record<string, number>;
  lastMovedAt: number;
}