import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Todo } from './todo.interface';

import { NotFoundException } from '@nestjs/common';

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  async createTodo(
    user: { id: string; email: string },
    request: Todo.CreateTodoRequest,
  ) {
    const todo = await this.prisma.todo.create({
      data: {
        ...request,
        userId: user.id,
      },
    });
    return todo;
  }

  async getTodo(id: string) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id,
      },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }

  async getTodos(user: { id: string; email: string }) {
    const todos = await this.prisma.todo.findMany({
      where: {
        userId: user.id,
      },
    });
    return todos;
  }

  async updateTodo(id: string, request: Todo.UpdateTodoRequest) {
    const todo = await this.prisma.todo.findUnique({
      where: {
        id,
      },
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return await this.prisma.todo.update({
      where: {
        id,
      },
      data: {
        ...request,
      },
    });
  }

  async deleteTodo(id: string) {
    const todo = await this.prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    await this.prisma.todo.delete({ where: { id } });
    return { id };
  }
}
