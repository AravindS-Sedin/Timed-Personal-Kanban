import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class ButtonComponent {
  @Input() label = '';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';

  @Output() pressed = new EventEmitter<void>();
}
