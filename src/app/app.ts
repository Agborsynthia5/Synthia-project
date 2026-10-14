import { Component, signal } from '@angular/core';
import { AddItem } from './add-item/add-item';
import { NewTodo, Todo } from './todo.model';
import { TodoList } from './todo-list/todo-list';

@Component({
  imports: [AddItem, TodoList],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-angular-app');

  todos: Todo[] = [];
  private nextTodoId = 1;

  addTodo(newTodo: NewTodo) {
    const title = newTodo.title.trim();
    if (!title) {
      return;
    }

    this.todos = [
      ...this.todos,
      { id: this.nextTodoId++, title, dueDate: newTodo.dueDate, completed: false },
    ];
  }

  deleteTodo(id: number) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }

  updateTodo(update: Todo) {
    this.todos = this.todos.map((todo) =>
      todo.id === update.id
        ? {
            ...todo,
            title: update.title.trim(),
            dueDate: update.dueDate,
            completed: update.completed,
          }
        : todo,
    );
  }

}
