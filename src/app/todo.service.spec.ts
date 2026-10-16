import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TodoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('adds todos with trimmed titles and ignores empty titles', () => {
    service.addTodo({ title: '  Plan a trip  ', dueDate: '2026-10-20T12:00' });
    service.addTodo({ title: '   ', dueDate: '2026-10-21T12:00' });

    expect(service.todos()).toEqual([
      { id: 1, title: 'Plan a trip', dueDate: '2026-10-20T12:00', completed: false },
    ]);
  });

  it('updates and deletes todos', () => {
    service.addTodo({ title: 'Plan a trip', dueDate: '2026-10-20T12:00' });
    service.updateTodo({
      id: 1,
      title: '  Book a trip  ',
      dueDate: '2026-10-21T12:00',
      completed: true,
    });

    expect(service.todos()).toEqual([
      { id: 1, title: 'Book a trip', dueDate: '2026-10-21T12:00', completed: true },
    ]);

    service.deleteTodo(1);
    expect(service.todos()).toEqual([]);
  });
});
