import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { getMinimumDueDateTime, isValidDueDateTime } from '../due-date-time';
import { Todo } from '../todo.model';
import { TodoService } from '../todo.service';

@Component({
  imports: [DatePipe, FormsModule, ReactiveFormsModule],
  selector: 'app-todo-list',
  styleUrl: './todo-list.css',
  templateUrl: './todo-list.html',
})
export class TodoList {
  readonly todoService = inject(TodoService);

  currentView = signal<'all' | 'active' | 'completed'>('all');
  editingTodoId: number | null = null;
  editTitle = new FormControl('', { nonNullable: true });
  editDueDate = new FormControl('', { nonNullable: true });
  readonly filteredTodos = computed(() => {
    const todos = this.todoService.todos();
    const currentView = this.currentView();

    if (currentView === 'active') {
      return todos.filter((todo) => !todo.completed);
    }
    if (currentView === 'completed') {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  });
  readonly completedCount = computed(
    () => this.todoService.todos().filter((todo) => todo.completed).length,
  );
  readonly activeCount = computed(
    () => this.todoService.todos().length - this.completedCount(),
  );

  get minimumDueDateTime(): string {
    return getMinimumDueDateTime();
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

    this.todoService.updateTodo({ ...todo, title, dueDate });
    this.cancelEdit();
  }

  cancelEdit() {
    this.editingTodoId = null;
    this.editTitle.setValue('');
    this.editDueDate.setValue('');
  }

  toggleCompleted(todo: Todo) {
    this.todoService.updateTodo({ ...todo, completed: !todo.completed });
  }
}
