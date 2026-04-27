import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input.html',
  styleUrl: './input.css'
})
export class InputComponent {
  @Input() value = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();
}
