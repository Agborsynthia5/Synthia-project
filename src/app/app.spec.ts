import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { getMinimumDueDateTime } from './due-date-time';
import { TodoService } from './todo.service';
import { TodoList } from './todo-list/todo-list';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Make room for');
  });

  it('should add, update, and delete todos', () => {
    const service = TestBed.inject(TodoService);

    service.addTodo({ title: '  Buy groceries  ', dueDate: '2026-10-20T12:00' });
    expect(service.todos()).toEqual([
      { id: 1, title: 'Buy groceries', dueDate: '2026-10-20T12:00', completed: false },
    ]);

    service.updateTodo({
      ...service.todos()[0],
      title: 'Buy food',
      dueDate: '2026-10-21T12:00',
      completed: true,
    });
    expect(service.todos()[0]).toEqual({
      id: 1,
      title: 'Buy food',
      dueDate: '2026-10-21T12:00',
      completed: true,
    });

    service.deleteTodo(1);
    expect(service.todos()).toEqual([]);
  });

  it('should ignore empty todos', () => {
    const service = TestBed.inject(TodoService);

    service.addTodo({ title: '   ', dueDate: '' });
    expect(service.todos()).toEqual([]);
  });

  it('should create a task from the form without submitting the browser page', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const input = compiled.querySelector<HTMLInputElement>('#new-task');
    const form = input?.closest('form');

    expect(input).not.toBeNull();
    expect(form).not.toBeNull();
    input!.value = 'Write tests';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    const dueDate = compiled.querySelector<HTMLInputElement>('#new-due-date');
    dueDate!.value = getMinimumDueDateTime();
    const submittedDueDate = dueDate!.value;
    dueDate!.dispatchEvent(new Event('input', { bubbles: true }));

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form!.dispatchEvent(submitEvent);
    fixture.detectChanges();

    expect(submitEvent.defaultPrevented).toBe(true);
    expect(TestBed.inject(TodoService).todos()).toContainEqual({
      id: 1,
      title: 'Write tests',
      dueDate: submittedDueDate,
      completed: false,
    });
    expect(compiled.querySelector('.task span')?.textContent?.trim()).toBe('Write tests');
    expect(compiled.querySelector('.due-date')?.getAttribute('datetime')).toBe(submittedDueDate);
    expect(compiled.querySelector('.due-date')?.textContent).toContain('Due ');
  });

  it('should filter the displayed tasks and update the due date', async () => {
    const fixture = TestBed.createComponent(TodoList);
    const list = fixture.componentInstance;
    list.todoService.todos.set([
      { id: 1, title: 'Active task', dueDate: '2026-10-20T12:00', completed: false },
      { id: 2, title: 'Finished task', dueDate: '2026-10-20T12:00', completed: true },
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const filters = compiled.querySelectorAll<HTMLButtonElement>('.filters button');
    filters[1].click();
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Active task');
    expect(compiled.textContent).not.toContain('Finished task');

    list.beginEdit(list.todoService.todos()[0]);
    list.editDueDate.setValue(getMinimumDueDateTime());
    const updated = vi.spyOn(list.todoService, 'updateTodo');
    list.saveEdit(list.todoService.todos()[0]);
    expect(updated).toHaveBeenCalledWith({
      id: 1,
      title: 'Active task',
      dueDate: getMinimumDueDateTime(),
      completed: false,
    });

    const deleted = vi.spyOn(list.todoService, 'deleteTodo');
    list.currentView.set('all');
    fixture.detectChanges();
    const deleteButton = compiled.querySelector<HTMLButtonElement>('.delete');
    deleteButton?.click();
    expect(deleted).toHaveBeenCalledWith(1);
  });
});
