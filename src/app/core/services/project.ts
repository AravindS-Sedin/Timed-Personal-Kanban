import { Injectable, computed, signal } from '@angular/core';
import { Project } from '../../models/project.model';
import { Column } from '../../models/column.model';
import { Task } from '../../models/task.model';
import { StorageService } from './storage';
import { TimeTrackingService } from './time-tracking';

const PROJECTS_KEY = 'kanban_projects';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  readonly projects = signal<Project[]>([]);
  readonly selectedProject = signal<Project | null>(null);
  readonly selectedProjectId = computed(() => this.selectedProject()?.id ?? null);

  private readonly defaultColumnNames = [
    'Todo',
    'Working',
    'Testing',
    'Review',
    'Actual Testing',
    'Completed'
  ];

  constructor(
    private readonly storageService: StorageService,
    private readonly timeTrackingService: TimeTrackingService
  ) {
    const stored = this.storageService.get<Project[]>(PROJECTS_KEY) ?? [];
    this.projects.set(stored);
  }

  createProject(name: string): Project {
    const project: Project = {
      id: this.generateId('project'),
      name: name.trim(),
      columns: this.defaultColumnNames.map((columnName) => ({
        id: this.generateId('column'),
        name: columnName,
        isDefault: true
      })),
      tasks: []
    };

    this.projects.update((items: Project[]) => [...items, project]);
    this.selectedProject.set(project);
    this.persist();
    return project;
  }

  selectProject(projectId: string): void {
    const project = this.projects().find((item: Project) => item.id === projectId) ?? null;
    this.selectedProject.set(project);
  }

  addTask(projectId: string, columnId: string, title: string): void {
    const now = Date.now();

    this.projects.update((items: Project[]) =>
      items.map((project: Project) => {
        if (project.id !== projectId) {
          return project;
        }

        const task: Task = this.timeTrackingService.startInColumn(
          {
            id: this.generateId('task'),
            title: title.trim(),
            columnId,
            timeSpent: {},
            lastMovedAt: now
          },
          columnId,
          now
        );

        const updated = {
          ...project,
          tasks: [...project.tasks, task]
        };

        this.selectedProject.set(updated);
        return updated;
      })
    );

    this.persist();
  }

  moveTask(taskId: string, newColumnId: string): void {
    const currentProject = this.selectedProject();
    if (!currentProject) {
      return;
    }

    const task = currentProject.tasks.find((item: Task) => item.id === taskId);
    if (!task || task.columnId === newColumnId) {
      return;
    }

    const movedTask = this.timeTrackingService.stopAndMove(task, newColumnId);

    this.projects.update((items: Project[]) =>
      items.map((project: Project) => {
        if (project.id !== currentProject.id) {
          return project;
        }

        const updated = {
          ...project,
          tasks: project.tasks.map((item: Task) => (item.id === taskId ? movedTask : item))
        };

        this.selectedProject.set(updated);
        return updated;
      })
    );

    this.persist();
  }

  deleteTask(taskId: string): void {
    const currentProject = this.selectedProject();
    if (!currentProject) {
      return;
    }

    this.projects.update((items: Project[]) =>
      items.map((project: Project) => {
        if (project.id !== currentProject.id) {
          return project;
        }

        const updated = {
          ...project,
          tasks: project.tasks.filter((task: Task) => task.id !== taskId)
        };

        this.selectedProject.set(updated);
        return updated;
      })
    );

    this.persist();
  }

  addColumn(projectId: string, name: string): void {
    this.projects.update((items: Project[]) =>
      items.map((project: Project) => {
        if (project.id !== projectId) {
          return project;
        }

        const newColumn: Column = {
          id: this.generateId('column'),
          name: name.trim(),
          isDefault: false
        };

        const completedIndex = project.columns.findIndex((column: Column) => this.isCompletedColumn(column));
        const nextColumns =
          completedIndex === -1
            ? [...project.columns, newColumn]
            : [
                ...project.columns.slice(0, completedIndex),
                newColumn,
                ...project.columns.slice(completedIndex)
              ];

        const updated = {
          ...project,
          columns: nextColumns
        };

        if (this.selectedProjectId() === project.id) {
          this.selectedProject.set(updated);
        }

        return updated;
      })
    );

    this.persist();
  }

  renameColumn(columnId: string, name: string): void {
    const currentProject = this.selectedProject();
    if (!currentProject) {
      return;
    }

    this.projects.update((items: Project[]) =>
      items.map((project: Project) => {
        if (project.id !== currentProject.id) {
          return project;
        }

        const updated = {
          ...project,
          columns: project.columns.map((column: Column) =>
            column.id === columnId ? { ...column, name: name.trim() } : column
          )
        };

        this.selectedProject.set(updated);
        return updated;
      })
    );

    this.persist();
  }

  renameProject(projectId: string, name: string): void {
    const nextName = name.trim();
    if (!nextName) {
      return;
    }

    this.projects.update((items: Project[]) =>
      items.map((project: Project) => {
        if (project.id !== projectId) {
          return project;
        }

        const updated = { ...project, name: nextName };

        if (this.selectedProjectId() === project.id) {
          this.selectedProject.set(updated);
        }

        return updated;
      })
    );

    this.persist();
  }

  deleteProject(projectId: string): void {
    this.projects.update((items: Project[]) => items.filter((project: Project) => project.id !== projectId));

    if (this.selectedProjectId() === projectId) {
      this.selectedProject.set(null);
    }

    this.persist();
  }

  deleteColumn(columnId: string, moveToColumnId: string): void {
    const currentProject = this.selectedProject();
    if (!currentProject || columnId === moveToColumnId) {
      return;
    }

    const targetColumn = currentProject.columns.find((column: Column) => column.id === moveToColumnId);
    if (!targetColumn) {
      return;
    }

    this.projects.update((items: Project[]) =>
      items.map((project: Project) => {
        if (project.id !== currentProject.id) {
          return project;
        }

        const deleting = project.columns.find((column: Column) => column.id === columnId);
        if (!deleting || (deleting.isDefault && (deleting.name === 'Todo' || deleting.name === 'Completed'))) {
          return project;
        }

        const updatedTasks = project.tasks.map((task: Task) =>
          task.columnId === columnId ? this.timeTrackingService.stopAndMove(task, moveToColumnId) : task
        );

        const updated = {
          ...project,
          columns: project.columns.filter((column: Column) => column.id !== columnId),
          tasks: updatedTasks
        };

        this.selectedProject.set(updated);
        return updated;
      })
    );

    this.persist();
  }

  getTasksByColumn(project: Project, columnId: string): Task[] {
    return project.tasks.filter((task) => task.columnId === columnId);
  }

  getTaskCount(project: Project): number {
    return project.tasks.length;
  }

  getColumnCount(project: Project): number {
    return project.columns.length;
  }

  getCompletedColumn(project: Project): Column | undefined {
    return project.columns.find((column: Column) => this.isCompletedColumn(column));
  }

  getTimeBreakdown(task: Task, project: Project): Array<{ columnName: string; milliseconds: number }> {
    return project.columns
      .map((column) => ({
        columnName: column.name,
        milliseconds: this.timeTrackingService.getTotalTimeForColumn(task, column.id)
      }))
      .filter((entry) => entry.milliseconds > 0);
  }

  private persist(): void {
    this.storageService.set(PROJECTS_KEY, this.projects());
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
  }

  private isCompletedColumn(column: Column): boolean {
    return column.name.trim().toLowerCase() === 'completed';
  }
}