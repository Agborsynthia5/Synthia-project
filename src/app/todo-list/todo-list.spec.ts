import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getMinimumDueDateTime } from '../due-date-time';
import { TodoService } from '../todo.service';
import { TodoList } from './todo-list';

describe('TodoList', () => {
  let component: TodoList;
  let fixture: ComponentFixture<TodoList>;
  let todoService: TodoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoList],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
    todoService = TestBed.inject(TodoService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not save an edit with a missing or past due date', () => {
    const todo = {
      id: 1,
      title: 'Plan a trip',
      dueDate: getMinimumDueDateTime(),
      completed: false,
    };
    todoService.todos.set([todo]);
    const updated = vi.spyOn(todoService, 'updateTodo');
    component.beginEdit(todo);

    component.editDueDate.setValue('');
    component.saveEdit(todo);
    expect(updated).not.toHaveBeenCalled();

    component.editDueDate.setValue('2000-01-01T12:00');
    component.saveEdit(todo);
    expect(updated).not.toHaveBeenCalled();

    component.editDueDate.setValue(getMinimumDueDateTime());
    component.saveEdit(todo);
    expect(updated).toHaveBeenCalledWith(todo);
  });

  it('tracks the currently edited todo with a signal', () => {
    const todo = {
      id: 1,
      title: 'Plan a trip',
      dueDate: getMinimumDueDateTime(),
      completed: false,
    };

    component.beginEdit(todo);
    expect(component.editingTodoId()).toBe(todo.id);

    component.cancelEdit();
    expect(component.editingTodoId()).toBeNull();
  });
});
