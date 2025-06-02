import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Todo } from './todo.interface';
import { TodoStatus } from '@prisma/client';

export class CreateTodoDto implements Todo.CreateTodoRequest {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateTodoDto implements Todo.UpdateTodoRequest {
  @IsString()
  title?: string;

  @IsString()
  description?: string;

  @IsEnum(TodoStatus)
  status?: TodoStatus;
}
