import { Injectable, signal } from '@angular/core';
import { NewTodo, Todo } from './todo.model';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  readonly todos = signal<Todo[]>([]);
  private nextTodoId = 1;

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
