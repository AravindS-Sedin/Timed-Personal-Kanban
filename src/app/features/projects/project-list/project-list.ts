import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../../core/services/project';
import { StorageService } from '../../../core/services/storage';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { Project } from '../../../models/project.model';
import { User } from '../../../models/user.model';

const USER_KEY = 'kanban_user';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css'
})
export class ProjectListComponent {
  projectName = '';
  editingProjectId: string | null = null;
  editProjectName = '';

  constructor(
    private readonly projectService: ProjectService,
    private readonly storageService: StorageService,
    private readonly router: Router
  ) {
    if (!this.userName) {
      void this.router.navigate(['/']);
    }
  }

  get projects(): Project[] {
    return this.projectService.projects();
  }

  get userName(): string {
    return this.storageService.get<User>(USER_KEY)?.name ?? '';
  }

  createProject(): void {
    const value = this.projectName.trim();
    if (!value) {
      return;
    }

    const created = this.projectService.createProject(value);
    this.projectName = '';
    void this.router.navigate(['/board', created.id]);
  }

  openProject(projectId: string): void {
    this.projectService.selectProject(projectId);
    void this.router.navigate(['/board', projectId]);
  }

  startEdit(project: Project): void {
    this.editingProjectId = project.id;
    this.editProjectName = project.name;
  }

  cancelEdit(): void {
    this.editingProjectId = null;
    this.editProjectName = '';
  }

  saveEdit(projectId: string): void {
    const value = this.editProjectName.trim();
    if (!value) {
      return;
    }

    this.projectService.renameProject(projectId, value);
    this.cancelEdit();
  }

  deleteProject(projectId: string): void {
    const confirmed = window.confirm('Delete this project? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    this.projectService.deleteProject(projectId);

    if (this.editingProjectId === projectId) {
      this.cancelEdit();
    }
  }

  taskCount(projectId: string): number {
    const project = this.projects.find((item: Project) => item.id === projectId);
    return project ? this.projectService.getTaskCount(project) : 0;
  }

  columnCount(projectId: string): number {
    const project = this.projects.find((item: Project) => item.id === projectId);
    return project ? this.projectService.getColumnCount(project) : 0;
  }
}
