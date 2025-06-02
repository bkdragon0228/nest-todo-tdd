import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  describe('/api/v1/auth/sign-up (POST)', () => {
    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 201 for valid signup data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-up')
        .send({
          email: 'test@test.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
        });
    });
  });

  describe('/api/v1/auth/sign-in (POST)', () => {
    it('should return 201 for valid signin data', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/sign-in')
        .send({
          email: 'test@test.com',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
        });
    });
  });
});
