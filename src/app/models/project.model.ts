import { Column } from './column.model';
import { Task } from './task.model';

export interface Project {
  id: string;
  name: string;
  columns: Column[];
  tasks: Task[];
}