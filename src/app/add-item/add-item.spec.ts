import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getMinimumDueDateTime } from '../due-date-time';
import { AddItem } from './add-item';

describe('AddItem', () => {
  let component: AddItem;
  let fixture: ComponentFixture<AddItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddItem],
    }).compileComponents();

    fixture = TestBed.createComponent(AddItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires a future due date and time before emitting a task', () => {
    const emitted = vi.spyOn(component.newTodo, 'emit');

    component.submitTodo();
    expect(emitted).not.toHaveBeenCalled();
    expect(component.errorMessage()).toContain('task title');

    component.newTask.setValue('Plan a trip');
    component.submitTodo();
    expect(emitted).not.toHaveBeenCalled();
    expect(component.errorMessage()).toContain('not in the past');

    component.newDueDate.setValue('2000-01-01T12:00');
    component.submitTodo();
    expect(emitted).not.toHaveBeenCalled();
    expect(component.errorMessage()).toContain('not in the past');

    const futureDateTime = getMinimumDueDateTime();
    component.newDueDate.setValue(futureDateTime);
    component.submitTodo();
    expect(emitted).toHaveBeenCalledWith({
      title: 'Plan a trip',
      dueDate: futureDateTime,
    });
    expect(component.errorMessage()).toBe('');
  });
});
