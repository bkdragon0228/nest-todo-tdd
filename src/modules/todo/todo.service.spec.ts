import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { PrismaService } from '../prisma/prisma.service';
import { TodoStatus } from '@prisma/client';

describe('TodoService', () => {
  let service: TodoService;
  let prisma: PrismaService;

  let testRequest: { title: string; description: string };
  let testTodo: {
    id: string;
    title: string;
    description: string;
    completed: TodoStatus;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
  };

  let testUser: {
    id: string;
    email: string;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: PrismaService,
          useValue: {
            todo: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    testRequest = {
      title: 'Test Todo',
      description: 'Test Description',
    };

    testUser = {
      id: '1',
      email: 'test@test.com',
    };

    testTodo = {
      id: '1',
      title: testRequest.title,
      description: testRequest.description,
      completed: TodoStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1',
    };

    service = module.get<TodoService>(TodoService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTodo', () => {
    it('should create a todo', async () => {
      jest.spyOn(prisma.todo, 'create').mockResolvedValue(testTodo);
      const result = await service.createTodo(testUser, testRequest);
      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: {
          ...testRequest,
          userId: testUser.id,
        },
      });
      expect(result).toEqual(testTodo);
    });
  });

  describe('getTodo', () => {
    it('should get a todo', async () => {
      jest.spyOn(prisma.todo, 'findUnique').mockResolvedValue(testTodo);
      const result = await service.getTodo(testTodo.id);
      expect(prisma.todo.findUnique).toHaveBeenCalledWith({
        where: {
          id: testTodo.id,
        },
      });
      expect(result).toEqual(testTodo);
    });

    it('should throw an error if todo is not found', async () => {
      jest.spyOn(prisma.todo, 'findUnique').mockResolvedValue(null);
      await expect(service.getTodo(testTodo.id)).rejects.toThrow(
        'Todo not found',
      );
      expect(prisma.todo.findUnique).toHaveBeenCalledWith({
        where: {
          id: testTodo.id,
        },
      });
      expect(prisma.todo.findUnique).toHaveBeenCalledWith({
        where: {
          id: testTodo.id,
        },
      });
    });

    it('should get all todos by user id', async () => {
      jest.spyOn(prisma.todo, 'findMany').mockResolvedValue([testTodo]);
      const result = await service.getTodos(testUser);
      expect(prisma.todo.findMany).toHaveBeenCalledWith({
        where: {
          userId: testUser.id,
        },
      });
      expect(result).toEqual([testTodo]);
    });
  });

  describe('updateTodo', () => {
    it('should update a todo', async () => {
      const updatedTodo = {
        ...testTodo,
        title: 'Updated Todo',
        description: 'Updated Description',
        completed: TodoStatus.COMPLETED,
        updatedAt: new Date(),
      };
      jest.spyOn(prisma.todo, 'findUnique').mockResolvedValue(testTodo);
      jest.spyOn(prisma.todo, 'update').mockResolvedValue(updatedTodo);

      const result = await service.updateTodo(testTodo.id, updatedTodo);
      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: {
          id: testTodo.id,
        },
        data: {
          ...updatedTodo,
        },
      });
      expect(result).toEqual(updatedTodo);
    });

    it('should throw an error if todo is not found', async () => {
      jest.spyOn(prisma.todo, 'findUnique').mockResolvedValue(null);
      await expect(
        service.updateTodo(testTodo.id, testRequest),
      ).rejects.toThrow('Todo not found');
      expect(prisma.todo.findUnique).toHaveBeenCalledWith({
        where: {
          id: testTodo.id,
        },
      });
      expect(prisma.todo.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', async () => {
      jest.spyOn(prisma.todo, 'findUnique').mockResolvedValue(testTodo);
      jest.spyOn(prisma.todo, 'delete').mockResolvedValue(testTodo);
      const result = await service.deleteTodo(testTodo.id);
      expect(prisma.todo.delete).toHaveBeenCalledWith({
        where: {
          id: testTodo.id,
        },
      });
      expect(result).toEqual(testTodo.id);
    });

    it('should throw an error if todo is not found', async () => {
      jest.spyOn(prisma.todo, 'findUnique').mockResolvedValue(null);
      await expect(service.deleteTodo(testTodo.id)).rejects.toThrow(
        'Todo not found',
      );
      expect(prisma.todo.delete).not.toHaveBeenCalled();
    });
  });
});
