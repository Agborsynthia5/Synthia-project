import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NewTodo, Todo } from './todo.model';

const TODO_STORAGE_KEY = 'todos';

function isTodoArray(value: unknown): value is Todo[] {
  return Array.isArray(value) && value.every((todo: unknown) =>
    typeof todo === 'object' &&
    todo !== null &&
    'id' in todo &&
    typeof todo.id === 'number' &&
    Number.isInteger(todo.id) &&
    todo.id > 0 &&
    'title' in todo &&
    typeof todo.title === 'string' &&
    'dueDate' in todo &&
    typeof todo.dueDate === 'string' &&
    'completed' in todo &&
    typeof todo.completed === 'boolean',
  );
}

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly todos = signal<Todo[]>(this.loadTodos());
  private nextTodoId = Math.max(0, ...this.todos().map((todo) => todo.id)) + 1;

  constructor() {
    effect(() => {
      const todos = this.todos();
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      try {
        localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error('Failed to save todos to localStorage.', error);
      }
    });
  }

  private loadTodos(): Todo[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const storedTodos = localStorage.getItem(TODO_STORAGE_KEY);
      if (storedTodos === null) {
        return [];
      }

      const parsedTodos: unknown = JSON.parse(storedTodos);
      if (!isTodoArray(parsedTodos)) {
        throw new Error('Stored todos have an invalid format.');
      }

      return parsedTodos;
    } catch (error) {
      console.error('Failed to load todos from localStorage.', error);
      return [];
    }
  }

  addTodo(newTodo: NewTodo): void {
    const title = newTodo.title.trim();
    if (!title) {
      return;
    }

    this.todos.update((todos) => [
      ...todos,
      { id: this.nextTodoId++, title, dueDate: newTodo.dueDate, completed: false },
    ]);
  }

  deleteTodo(id: number): void {
    this.todos.update((todos) => todos.filter((todo) => todo.id !== id));
  }

  clearCompleted(): void {
    this.todos.update((todos) => todos.filter((todo) => !todo.completed));
  }

  updateTodo(update: Todo): void {
    this.todos.update((todos) => todos.map((todo) =>
      todo.id === update.id
        ? {
            ...todo,
            title: update.title.trim(),
            dueDate: update.dueDate,
            completed: update.completed,
          }
        : todo,
    ));
  }
}
