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
    expect(component.editErrorMessage()).toContain('not in the past');

    component.editDueDate.setValue(getMinimumDueDateTime());
    component.saveEdit(todo);
    expect(updated).toHaveBeenCalledWith(todo);
  });

  it('allows renaming an overdue todo without changing its due date', () => {
    const todo = {
      id: 1,
      title: 'Plan a trip',
      dueDate: '2000-01-01T12:00',
      completed: false,
    };
    const updated = vi.spyOn(todoService, 'updateTodo');

    component.beginEdit(todo);
    component.editTitle.setValue('Plan a vacation');
    component.saveEdit(todo);

    expect(updated).toHaveBeenCalledWith({
      ...todo,
      title: 'Plan a vacation',
    });
    expect(component.editingTodoId()).toBeNull();
  });

  it('shows an error in the edit form when a new due date is in the past', () => {
    const todo = {
      id: 1,
      title: 'Plan a trip',
      dueDate: getMinimumDueDateTime(),
      completed: false,
    };
    todoService.todos.set([todo]);
    const updated = vi.spyOn(todoService, 'updateTodo');

    component.beginEdit(todo);
    component.editDueDate.setValue('2000-01-01T12:00');
    component.saveEdit(todo);
    fixture.detectChanges();

    expect(updated).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent)
      .toContain('not in the past');
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

  it('cancels on Escape without saving and restores focus to Edit', async () => {
    const todo = {
      id: 1,
      title: 'Plan a trip',
      dueDate: getMinimumDueDateTime(),
      completed: false,
    };
    todoService.todos.set([todo]);
    const updated = vi.spyOn(todoService, 'updateTodo');
    fixture.detectChanges();

    component.beginEdit(todo);
    fixture.detectChanges();
    component.editTitle.setValue('Unsaved title');
    const host = fixture.nativeElement as HTMLElement;
    const titleInput = host.querySelector<HTMLInputElement>('#edit-task-1')!;
    titleInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.editingTodoId()).toBeNull();
    expect(updated).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(
      host.querySelector('#edit-button-1'),
    );
    expect(todoService.todos()[0].title).toBe('Plan a trip');
  });

  it('deletes a todo after the user confirms', () => {
    const todo = {
      id: 1,
      title: 'Plan a trip',
      dueDate: getMinimumDueDateTime(),
      completed: false,
    };
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const deleted = vi.spyOn(todoService, 'deleteTodo');

    component.confirmDelete(todo);

    expect(confirm).toHaveBeenCalledWith(
      'Delete "Plan a trip"? This action cannot be undone.',
    );
    expect(deleted).toHaveBeenCalledWith(todo.id);
    confirm.mockRestore();
  });

  it('keeps a todo when the user cancels deletion', () => {
    const todo = {
      id: 1,
      title: 'Plan a trip',
      dueDate: getMinimumDueDateTime(),
      completed: false,
    };
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const deleted = vi.spyOn(todoService, 'deleteTodo');

    component.confirmDelete(todo);

    expect(deleted).not.toHaveBeenCalled();
    confirm.mockRestore();
  });

  it('visually marks overdue active todos but not future or completed todos', () => {
    const now = new Date('2026-10-20T12:00:00');
    component.currentTime.set(now.getTime());
    todoService.todos.set([
      { id: 1, title: 'Overdue task', dueDate: '2026-10-20T11:59', completed: false },
      { id: 2, title: 'Future task', dueDate: '2026-10-20T12:01', completed: false },
      { id: 3, title: 'Completed task', dueDate: '2026-10-20T11:00', completed: true },
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.task.overdue .task-title')?.textContent)
      .toContain('Overdue task');
    expect(compiled.querySelector('.task.overdue .overdue-indicator')?.textContent)
      .toContain('Overdue');
    const taskElements = [...compiled.querySelectorAll<HTMLElement>('.task')];
    const futureTask = taskElements.find((task) => task.textContent?.includes('Future task'));
    expect(futureTask?.classList.contains('overdue')).toBe(false);
    const completedTask = taskElements
      .find((task) => task.textContent?.includes('Completed task'));
    expect(completedTask?.classList.contains('overdue')).toBe(false);
    expect(completedTask?.querySelector('.overdue-indicator')).toBeNull();
  });

  it('marks a task overdue when the clock passes its due date', () => {
    const todo = {
      id: 1,
      title: 'Upcoming task',
      dueDate: '2026-10-20T12:01',
      completed: false,
    };
    component.currentTime.set(new Date('2026-10-20T12:00:00').getTime());
    todoService.todos.set([todo]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task.overdue')).toBeNull();

    component.currentTime.set(new Date('2026-10-20T12:02:00').getTime());
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.task.overdue')).not.toBeNull();
  });

  it('sorts tasks by due date in all, active, and completed views', () => {
    const laterActive = {
      id: 1,
      title: 'Later active',
      dueDate: '2026-10-22T12:00',
      completed: false,
    };
    const earlierCompleted = {
      id: 2,
      title: 'Earlier completed',
      dueDate: '2026-10-20T12:00',
      completed: true,
    };
    const middleActive = {
      id: 3,
      title: 'Middle active',
      dueDate: '2026-10-21T12:00',
      completed: false,
    };
    const laterCompleted = {
      id: 4,
      title: 'Later completed',
      dueDate: '2026-10-23T12:00',
      completed: true,
    };
    todoService.todos.set([laterActive, earlierCompleted, laterCompleted, middleActive]);

    expect(component.filteredTodos().map((todo) => todo.id)).toEqual([2, 3, 1, 4]);

    component.currentView.set('active');
    expect(component.filteredTodos().map((todo) => todo.id)).toEqual([3, 1]);

    component.currentView.set('completed');
    expect(component.filteredTodos().map((todo) => todo.id)).toEqual([2, 4]);
  });

  it('disables Clear completed when empty and clears completed tasks when clicked', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const clearButton = compiled.querySelector<HTMLButtonElement>('.clear-completed')!;

    expect(clearButton.disabled).toBe(true);

    todoService.todos.set([
      { id: 1, title: 'Active task', dueDate: '2026-10-20T12:00', completed: false },
      { id: 2, title: 'Completed task', dueDate: '2026-10-21T12:00', completed: true },
    ]);
    fixture.detectChanges();

    expect(clearButton.disabled).toBe(false);
    clearButton.click();
    fixture.detectChanges();

    expect(todoService.todos().map((todo) => todo.title)).toEqual(['Active task']);
    expect(clearButton.disabled).toBe(true);
  });
});
