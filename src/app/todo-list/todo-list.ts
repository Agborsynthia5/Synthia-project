import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getMinimumDueDateTime, isValidDueDateTime } from '../due-date-time';
import { Todo } from '../todo.model';

@Component({
  imports: [DatePipe, FormsModule, ReactiveFormsModule],
  selector: 'app-todo-list',
  styleUrl: './todo-list.css',
  templateUrl: './todo-list.html',
})
export class TodoList {
  @Input() todos: Todo[] = [];
  @Output() deleteTodo = new EventEmitter<number>();
  @Output() updateTodo = new EventEmitter<Todo>();

  currentView: 'all' | 'active' | 'completed' = 'all';
  editingTodoId: number | null = null;
  editTitle = new FormControl('', { nonNullable: true });
  editDueDate = new FormControl('', { nonNullable: true });

  get minimumDueDateTime(): string {
    return getMinimumDueDateTime();
  }

  get filteredTodos(): Todo[] {
    if (this.currentView === 'active') {
      return this.todos.filter((todo) => !todo.completed);
    }
    if (this.currentView === 'completed') {
      return this.todos.filter((todo) => todo.completed);
    }
    return this.todos;
  }

  get completedCount(): number {
    return this.todos.filter((todo) => todo.completed).length;
  }

  get activeCount(): number {
    return this.todos.length - this.completedCount;
  }

  beginEdit(todo: Todo) {
    this.editingTodoId = todo.id;
    this.editTitle.setValue(todo.title);
    this.editDueDate.setValue(todo.dueDate);
  }

  saveEdit(todo: Todo) {
    const title = this.editTitle.value.trim();
    const dueDate = this.editDueDate.value;
    if (!title || !isValidDueDateTime(dueDate)) {
      return;
    }

    this.updateTodo.emit({ ...todo, title, dueDate });
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingTodoId = null;
    this.editTitle.setValue('');
    this.editDueDate.setValue('');
  }

  toggleCompleted(todo: Todo) {
    this.updateTodo.emit({ ...todo, completed: !todo.completed });
  }
}
