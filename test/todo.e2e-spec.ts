import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { UserGuard } from '../src/common/guards/user.guard';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

describe('TodoController (e2e)', () => {
  let app: INestApplication;
  let createdTodoId: string;

  let authUser: User;

  beforeAll(async () => {
    authUser = await prisma.user.create({
      data: {
        id: 'todo-test-user-id',
        email: 'todo-test@test.com',
        password: 'hashed',
      },
    });
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(UserGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          const authHeader = request.headers['authorization'];
          if (!authHeader) {
            throw new UnauthorizedException('No access token');
          }
          request['user'] = {
            id: authUser.id,
            email: authUser.email,
          };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/todos (POST)', () => {
    it('should return 401 if no access token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/todos')
        .send({ title: 'Test Todo', description: 'Test Description' })
        .expect(401);
    });

    it('should return 400 if invalid request', () => {
      return request(app.getHttpServer())
        .post('/api/v1/todos')
        .set('Authorization', 'Bearer valid-token')
        .send({ title: 'Test Todo' })
        .expect(400);
    });

    it('should return 201 if valid request', () => {
      return request(app.getHttpServer())
        .post('/api/v1/todos')
        .set('Authorization', 'Bearer valid-token')
        .send({ title: 'Test Todo', description: 'Test Description' })
        .expect(201)
        .expect((res) => {
          createdTodoId = res.body.id;
        });
    });
  });

  describe('/api/v1/todos (GET)', () => {
    it('should return 404 if todo is not exist', () => {
      return request(app.getHttpServer())
        .get('/api/v1/todos/random-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Todo not found');
        });
    });

    it('should return 200 if valid request', () => {
      return request(app.getHttpServer())
        .get('/api/v1/todos')
        .set('Authorization', 'Bearer valid-token')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].title).toBe('Test Todo');
          expect(res.body[0].description).toBe('Test Description');
          expect(res.body[0].userId).toBe('todo-test-user-id');
        });
    });
  });

  describe('/api/v1/todos/:id (PUT)', () => {
    it('should return 404 if todo is not exist', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/todos/random-id`)
        .set('Authorization', 'Bearer valid-token')
        .send({ title: 'Updated Todo', description: 'Updated Description' })
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Todo not found');
        });
    });

    it('should return 200 if valid request', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/todos/${createdTodoId}`)
        .set('Authorization', 'Bearer valid-token')
        .send({ title: 'Updated Todo', description: 'Updated Description' })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Updated Todo');
          expect(res.body.description).toBe('Updated Description');
          expect(res.body.userId).toBe('todo-test-user-id');
        });
    });
  });

  describe('/api/v1/todos/:id (DELETE)', () => {
    it('should return 404 if todo is not exist', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/todos/random-id`)
        .set('Authorization', 'Bearer valid-token')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('Todo not found');
        });
    });

    it('should return 200 if valid request', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/todos/${createdTodoId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTodoId);
        });
    });
  });
});
