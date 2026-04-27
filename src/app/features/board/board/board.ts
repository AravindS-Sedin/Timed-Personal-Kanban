import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../../core/services/project';
import { StorageService } from '../../../core/services/storage';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { ColumnComponent } from '../column/column';
import { Column } from '../../../models/column.model';
import { Project } from '../../../models/project.model';
import { User } from '../../../models/user.model';
import { Task } from '../../../models/task.model';
 
const USER_KEY = 'kanban_user';
 
@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule, InputComponent, ButtonComponent, ColumnComponent],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class BoardComponent {
  addColumnName = '';
  pendingDeleteColumnId: string | null = null;
  moveTargetColumnId = '';
 
  constructor(
    private readonly projectService: ProjectService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly storageService: StorageService
  ) {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.projectService.selectProject(projectId);
    }
 
    if (!this.userName) {
      void this.router.navigate(['/']);
      return;
    }
 
    if (!this.project) {
      void this.router.navigate(['/projects']);
    }
  }
 
  get project(): Project | null {
    return this.projectService.selectedProject();
  }
 
  get userName(): string {
    return this.storageService.get<User>(USER_KEY)?.name ?? '';
  }
 
  get dropListIds(): string[] {
    return this.project?.columns.map((column: Column) => `drop-${column.id}`) ?? [];
  }
 
  get completedColumnId(): string {
    if (!this.project) {
      return '';
    }
 
    return this.projectService.getCompletedColumn(this.project)?.id ?? '';
  }
 
  tasksForColumn(columnId: string): Task[] {
    const currentProject = this.project;
    return currentProject ? this.projectService.getTasksByColumn(currentProject, columnId) : [];
  }
 
  addColumn(): void {
    const currentProject = this.project;
    const name = this.addColumnName.trim();
 
    if (!currentProject || !name) {
      return;
    }
 
    this.projectService.addColumn(currentProject.id, name);
    this.addColumnName = '';
  }
 
  onTaskDropped(payload: { event: CdkDragDrop<Task[]>; columnId: string }): void {
    const task = payload.event.item.data as Task;
    if (!task || task.columnId === payload.columnId) {
      return;
    }
 
    this.projectService.moveTask(task.id, payload.columnId);
  }
 
  onTaskAdd(payload: { columnId: string; title: string }): void {
    const currentProject = this.project;
    if (!currentProject) {
      return;
    }
 
    this.projectService.addTask(currentProject.id, payload.columnId, payload.title);
  }
 
  onTaskDelete(taskId: string): void {
    this.projectService.deleteTask(taskId);
  }
 
  onColumnRename(payload: { columnId: string; name: string }): void {
    this.projectService.renameColumn(payload.columnId, payload.name);
  }
 
  onColumnDeleteRequest(columnId: string): void {
    const currentProject = this.project;
    if (!currentProject) {
      return;
    }
 
    const otherColumns = currentProject.columns.filter((column: Column) => column.id !== columnId);
    if (!otherColumns.length) {
      return;
    }
 
    const hasTasks = currentProject.tasks.some((task: Task) => task.columnId === columnId);
 
    if (!hasTasks) {
      this.projectService.deleteColumn(columnId, otherColumns[0].id);
      return;
    }
 
    this.pendingDeleteColumnId = columnId;
    this.moveTargetColumnId = otherColumns[0].id;
  }
 
  confirmColumnDelete(): void {
    if (!this.pendingDeleteColumnId || !this.moveTargetColumnId) {
      return;
    }
 
    this.projectService.deleteColumn(this.pendingDeleteColumnId, this.moveTargetColumnId);
    this.pendingDeleteColumnId = null;
    this.moveTargetColumnId = '';
  }
 
  cancelColumnDelete(): void {
    this.pendingDeleteColumnId = null;
    this.moveTargetColumnId = '';
  }
}