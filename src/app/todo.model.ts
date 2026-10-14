export interface Todo {
  id: number;
  title: string;
  dueDate: string;
  completed: boolean;
}

export type NewTodo = Pick<Todo, 'title' | 'dueDate'>;
