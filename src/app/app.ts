import { Component, inject, signal } from '@angular/core';
import { AddItem } from './add-item/add-item';
import { TodoService } from './todo.service';
import { TodoList } from './todo-list/todo-list';

@Component({
  imports: [AddItem, TodoList],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-angular-app');
  protected readonly todoService = inject(TodoService);
}
