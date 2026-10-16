import { Component, DestroyRef, Injector, afterNextRender, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { DatePipe, DOCUMENT, isPlatformBrowser } from '@angular/common';
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
  protected readonly todoService = inject(TodoService);

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  readonly currentTime = signal(Date.now());
  currentView = signal<'all' | 'active' | 'completed'>('all');
  editingTodoId = signal<number | null>(null);
  editErrorMessage = signal('');
  editTitle = new FormControl('', { nonNullable: true });
  editDueDate = new FormControl('', { nonNullable: true });
  readonly filteredTodos = computed(() => {
    const todos = [...this.todoService.todos()].sort((a, b) =>
      a.dueDate.localeCompare(b.dueDate),
    );
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

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const timer = window.setInterval(() => this.currentTime.set(Date.now()), 30_000);
      this.destroyRef.onDestroy(() => window.clearInterval(timer));
    }
  }

  get minimumDueDateTime(): string {
    return getMinimumDueDateTime();
  }

  isOverdue(todo: Todo): boolean {
    const dueDate = new Date(todo.dueDate).getTime();
    return !todo.completed && Number.isFinite(dueDate) && dueDate < this.currentTime();
  }

  beginEdit(todo: Todo) {
    this.editingTodoId.set(todo.id);
    this.editErrorMessage.set('');
    this.editTitle.setValue(todo.title);
    this.editDueDate.setValue(todo.dueDate);
  }

  saveEdit(todo: Todo) {
    const title = this.editTitle.value.trim();
    const dueDate = this.editDueDate.value;
    if (!title) {
      this.editErrorMessage.set('Enter a task title.');
      return;
    }

    if (!dueDate || (dueDate !== todo.dueDate && !isValidDueDateTime(dueDate))) {
      this.editErrorMessage.set('Choose a due date and time that is not in the past.');
      return;
    }

    this.todoService.updateTodo({ ...todo, title, dueDate });
    this.cancelEdit();
  }

  clearEditError() {
    this.editErrorMessage.set('');
  }

  cancelEdit(restoreFocusToTodoId?: number) {
    this.editingTodoId.set(null);
    this.editErrorMessage.set('');
    this.editTitle.setValue('');
    this.editDueDate.setValue('');

    if (restoreFocusToTodoId !== undefined) {
      afterNextRender(
        () => this.document.getElementById(`edit-button-${restoreFocusToTodoId}`)?.focus(),
        { injector: this.injector },
      );
    }
  }

  toggleCompleted(todo: Todo) {
    this.todoService.updateTodo({ ...todo, completed: !todo.completed });
  }

  confirmDelete(todo: Todo) {
    if (window.confirm(`Delete "${todo.title}"? This action cannot be undone.`)) {
      this.todoService.deleteTodo(todo.id);
    }
  }
}
