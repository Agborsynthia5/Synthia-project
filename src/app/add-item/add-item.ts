import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getMinimumDueDateTime, isValidDueDateTime } from '../due-date-time';
import { NewTodo } from '../todo.model';

@Component({
  selector: 'app-add-item',
  imports: [FormsModule, ReactiveFormsModule],
  styleUrl: './add-item.css',
  templateUrl: './add-item.html',
})
export class AddItem {
  newTask = new FormControl('', { nonNullable: true });
  newDueDate = new FormControl('', { nonNullable: true });
  errorMessage = '';

  @Output() newTodo = new EventEmitter<NewTodo>();

  get minimumDueDateTime(): string {
    return getMinimumDueDateTime();
  }

  submitTodo() {
    const title = this.newTask.value.trim();
    const dueDate = this.newDueDate.value;

    if (!title) {
      this.errorMessage = 'Enter a task title.';
      return;
    }

    if (!isValidDueDateTime(dueDate)) {
      this.errorMessage = 'Choose a due date and time that is not in the past.';
      return;
    }

    this.errorMessage = '';
    this.newTodo.emit({ title, dueDate });
    this.newTask.setValue('');
    this.newDueDate.setValue('');
  }

  clearError() {
    this.errorMessage = '';
  }
}
