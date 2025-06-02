import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { Todo } from './todo.interface';
import { Todo as TodoType } from '@prisma/client';
import { UserGuard } from '../../common/guards/user.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException } from '@nestjs/common';

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  let user: { id: string; email: string };
  let request: Todo.CreateTodoRequest;
  let updateRequest: Todo.UpdateTodoRequest;
  let todo: TodoType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoController,
        UserGuard,
        JwtService,
        ConfigService,
        PrismaService,
        {
          provide: TodoService,
          useValue: {
            getTodos: jest.fn(),
            createTodo: jest.fn(),
            getTodo: jest.fn(),
            updateTodo: jest.fn(),
            deleteTodo: jest.fn(),
          },
        },
      ],
    }).compile();

    user = {
      id: '1',
      email: 'test@test.com',
    };
    request = {
      title: 'Test Todo',
      description: 'Test Description',
    };
    updateRequest = {
      title: 'Updated Todo',
      description: 'Updated Description',
      status: 'COMPLETED',
    };
    todo = {
      id: '1',
      title: 'Test Todo',
      description: 'Test Description',
      completed: 'PENDING',
      userId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTodos', () => {
    it('should get todos', async () => {
      const todos = [todo];
      jest.spyOn(service, 'getTodos').mockResolvedValue(todos);
      const result = await controller.getTodos(user);
      expect(result).toEqual(todos);
      expect(service.getTodos).toHaveBeenCalledWith(user);
    });

    it('should return empty array if no todos', async () => {
      jest.spyOn(service, 'getTodos').mockResolvedValue([]);
      const result = await controller.getTodos(user);
      expect(result).toEqual([]);
    });

    it('should throw if getTodos fails', async () => {
      jest
        .spyOn(service, 'getTodos')
        .mockRejectedValue(new NotFoundException('No todos'));
      await expect(controller.getTodos(user)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTodo', () => {
    it('should create a todo', async () => {
      jest.spyOn(service, 'createTodo').mockResolvedValue(todo);
      const result = await controller.createTodo(user, request);
      expect(result).toEqual(todo);
      expect(service.createTodo).toHaveBeenCalledWith(user, request);
    });

    it('should throw if createTodo fails', async () => {
      jest
        .spyOn(service, 'createTodo')
        .mockRejectedValue(new Error('Create failed'));
      await expect(controller.createTodo(user, request)).rejects.toThrow(
        'Create failed',
      );
    });
  });

  describe('getTodo', () => {
    it('should get a todo', async () => {
      jest.spyOn(service, 'getTodo').mockResolvedValue(todo);
      const result = await controller.getTodo(todo.id);
      expect(result).toEqual(todo);
      expect(service.getTodo).toHaveBeenCalledWith(todo.id);
    });

    it('should throw if getTodo fails', async () => {
      jest
        .spyOn(service, 'getTodo')
        .mockRejectedValue(new NotFoundException('Not found'));
      await expect(controller.getTodo(todo.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTodo', () => {
    it('should update a todo', async () => {
      jest.spyOn(service, 'updateTodo').mockResolvedValue(todo);
      const result = await controller.updateTodo(todo.id, updateRequest);
      expect(result).toEqual(todo);
      expect(service.updateTodo).toHaveBeenCalledWith(todo.id, updateRequest);
    });

    it('should throw if updateTodo fails', async () => {
      jest
        .spyOn(service, 'updateTodo')
        .mockRejectedValue(new NotFoundException('Not found'));
      await expect(
        controller.updateTodo(todo.id, updateRequest),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', async () => {
      jest.spyOn(service, 'deleteTodo').mockResolvedValue(todo.id);
      const result = await controller.deleteTodo(todo.id);
      expect(result).toEqual(todo.id);
      expect(service.deleteTodo).toHaveBeenCalledWith(todo.id);
    });

    it('should throw if deleteTodo fails', async () => {
      jest
        .spyOn(service, 'deleteTodo')
        .mockRejectedValue(new NotFoundException('Not found'));
      await expect(controller.deleteTodo(todo.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
