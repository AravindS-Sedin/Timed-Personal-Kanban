import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Column } from '../../../models/column.model';
import { Task } from '../../../models/task.model';
import { InputComponent } from '../../../shared/components/input/input';
import { ButtonComponent } from '../../../shared/components/button/button';
import { TaskCardComponent } from '../task-card/task-card';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, InputComponent, ButtonComponent, TaskCardComponent],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css'
})
export class ColumnComponent {
  @Input({ required: true }) column!: Column;
  @Input() tasks: Task[] = [];
  @Input() connectedDropListIds: string[] = [];
  @Input() completedColumnId = '';

  @Output() taskDrop = new EventEmitter<{ event: CdkDragDrop<Task[]>; columnId: string }>();
  @Output() taskAdd = new EventEmitter<{ columnId: string; title: string }>();
  @Output() taskDelete = new EventEmitter<string>();
  @Output() columnRename = new EventEmitter<{ columnId: string; name: string }>();
  @Output() columnDeleteRequest = new EventEmitter<string>();

  taskTitle = '';
  renameMode = false;
  renameValue = '';

  get dropListId(): string {
    return `drop-${this.column.id}`;
  }

  get isLockedColumn(): boolean {
    return this.column.name === 'Todo' || this.column.name === 'Completed';
  }

  addTask(): void {
    const title = this.taskTitle.trim();
    if (!title) {
      return;
    }

    this.taskAdd.emit({ columnId: this.column.id, title });
    this.taskTitle = '';
  }

  startRename(): void {
    this.renameMode = true;
    this.renameValue = this.column.name;
  }

  saveRename(): void {
    const value = this.renameValue.trim();
    if (!value) {
      return;
    }

    this.columnRename.emit({ columnId: this.column.id, name: value });
    this.renameMode = false;
  }
}
