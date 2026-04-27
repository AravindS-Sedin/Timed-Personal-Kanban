import { Injectable } from '@angular/core';
import { Task } from '../../models/task.model';

@Injectable({ providedIn: 'root' })
export class TimeTrackingService {
  startInColumn(task: Task, columnId: string, now = Date.now()): Task {
    return {
      ...task,
      columnId,
      lastMovedAt: now,
      timeSpent: task.timeSpent ?? {}
    };
  }

  stopAndMove(task: Task, newColumnId: string, now = Date.now()): Task {
    const currentSpent = task.timeSpent?.[task.columnId] ?? 0;
    const delta = Math.max(0, now - task.lastMovedAt);

    return {
      ...task,
      columnId: newColumnId,
      lastMovedAt: now,
      timeSpent: {
        ...(task.timeSpent ?? {}),
        [task.columnId]: currentSpent + delta
      }
    };
  }

  finalizeCurrentColumn(task: Task, now = Date.now()): Task {
    const currentSpent = task.timeSpent?.[task.columnId] ?? 0;
    const delta = Math.max(0, now - task.lastMovedAt);

    return {
      ...task,
      lastMovedAt: now,
      timeSpent: {
        ...(task.timeSpent ?? {}),
        [task.columnId]: currentSpent + delta
      }
    };
  }

  getTotalTimeForColumn(task: Task, columnId: string, includeRunning = true, now = Date.now()): number {
    const settled = task.timeSpent?.[columnId] ?? 0;

    if (!includeRunning || task.columnId !== columnId) {
      return settled;
    }

    return settled + Math.max(0, now - task.lastMovedAt);
  }

  formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
}