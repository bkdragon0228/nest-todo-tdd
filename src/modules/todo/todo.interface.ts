import { TodoStatus, Todo as TodoType } from '@prisma/client';

export type Todo = Todo.CreateTodoRequest | Todo.UpdateTodoRequest;
export namespace Todo {
  export interface CreateTodoRequest {
    title: TodoType['title'];
    description: TodoType['description'];
  }

  export interface UpdateTodoRequest {
    title?: TodoType['title'];
    description?: TodoType['description'];
    status?: TodoStatus;
  }
}
