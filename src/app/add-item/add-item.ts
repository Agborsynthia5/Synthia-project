import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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

  @Output() newTodo = new EventEmitter<NewTodo>();

  submitTodo() {
    const title = this.newTask.value.trim();
    if (title) {
      this.newTodo.emit({ title, dueDate: this.newDueDate.value });
      this.newTask.setValue('');
      this.newDueDate.setValue('');
    }
  }
}
