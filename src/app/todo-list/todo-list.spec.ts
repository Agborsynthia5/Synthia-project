import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getMinimumDueDateTime } from '../due-date-time';
import { TodoList } from './todo-list';

describe('TodoList', () => {
  let component: TodoList;
  let fixture: ComponentFixture<TodoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoList],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoList);
    component = fixture.componentInstance;
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
    const emitted = vi.spyOn(component.updateTodo, 'emit');
    component.beginEdit(todo);

    component.editDueDate.setValue('');
    component.saveEdit(todo);
    expect(emitted).not.toHaveBeenCalled();

    component.editDueDate.setValue('2000-01-01T12:00');
    component.saveEdit(todo);
    expect(emitted).not.toHaveBeenCalled();

    component.editDueDate.setValue(getMinimumDueDateTime());
    component.saveEdit(todo);
    expect(emitted).toHaveBeenCalledWith(todo);
  });
});
