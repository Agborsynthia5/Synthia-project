import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    service = TestBed.inject(TodoService);
    expect(service).toBeTruthy();
  });

  it('adds todos with trimmed titles and ignores empty titles', async () => {
    service = TestBed.inject(TodoService);
    service.addTodo({ title: '  Plan a trip  ', dueDate: '2026-10-20T12:00' });
    service.addTodo({ title: '   ', dueDate: '2026-10-21T12:00' });

    expect(service.todos()).toEqual([
      { id: 1, title: 'Plan a trip', dueDate: '2026-10-20T12:00', completed: false },
    ]);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(JSON.parse(localStorage.getItem('todos') ?? '[]')).toEqual(service.todos());
  });

  it('saves updates and deletions to localStorage', async () => {
    service = TestBed.inject(TodoService);
    service.addTodo({ title: 'Plan a trip', dueDate: '2026-10-20T12:00' });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(JSON.parse(localStorage.getItem('todos') ?? '[]')).toEqual(service.todos());

    service.updateTodo({
      id: 1,
      title: '  Book a trip  ',
      dueDate: '2026-10-21T12:00',
      completed: true,
    });

    expect(service.todos()).toEqual([
      { id: 1, title: 'Book a trip', dueDate: '2026-10-21T12:00', completed: true },
    ]);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(JSON.parse(localStorage.getItem('todos') ?? '[]')).toEqual(service.todos());

    service.deleteTodo(1);
    expect(service.todos()).toEqual([]);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(JSON.parse(localStorage.getItem('todos') ?? '[]')).toEqual([]);
  });

  it('clears completed todos and keeps active todos', async () => {
    service = TestBed.inject(TodoService);
    service.todos.set([
      { id: 1, title: 'Active task', dueDate: '2026-10-20T12:00', completed: false },
      { id: 2, title: 'Completed task', dueDate: '2026-10-21T12:00', completed: true },
    ]);

    service.clearCompleted();

    expect(service.todos()).toEqual([
      { id: 1, title: 'Active task', dueDate: '2026-10-20T12:00', completed: false },
    ]);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(JSON.parse(localStorage.getItem('todos') ?? '[]')).toEqual(service.todos());
  });

  it('loads saved todos on startup and continues IDs after the saved todos', () => {
    const savedTodos = [
      { id: 4, title: 'Plan a trip', dueDate: '2026-10-20T12:00', completed: false },
    ];
    localStorage.setItem('todos', JSON.stringify(savedTodos));

    service = TestBed.inject(TodoService);
    expect(service.todos()).toEqual(savedTodos);

    service.addTodo({ title: 'Book a hotel', dueDate: '2026-10-21T12:00' });
    expect(service.todos()[1].id).toBe(5);
  });
});
