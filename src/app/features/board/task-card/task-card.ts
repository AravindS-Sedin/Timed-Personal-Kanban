import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../models/task.model';
import { ProjectService } from '../../../core/services/project';
import { TimeTrackingService } from '../../../core/services/time-tracking';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Input() showBreakdown = false;

  @Output() deleteTask = new EventEmitter<string>();

  breakdown(): Array<{ columnName: string; milliseconds: number }> {
    if (!this.showBreakdown) {
      return [];
    }

    const project = this.projectService.selectedProject();
    if (!project) {
      return [];
    }

    return this.projectService.getTimeBreakdown(this.task, project);
  }

  constructor(
    private readonly projectService: ProjectService,
    readonly timeTrackingService: TimeTrackingService
  ) {}
}
