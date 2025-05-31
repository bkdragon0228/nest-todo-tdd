import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let testRequest: { email: string; password: string };
  let testUser: {
    id: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  };
  let testToken: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    testRequest = {
      email: 'test@test.com',
      password: 'password',
    };
    testUser = {
      id: 'test-id',
      email: 'test@test.com',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    testToken = 'test-token';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('should create a new user', async () => {
      jest.spyOn(prisma.user, 'create').mockResolvedValue(testUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue(testToken);
      const hashedPassword = 'hashed_password';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      const result = await service.signUp(testRequest);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: testRequest.email,
          password: hashedPassword,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: testUser.id,
        email: testUser.email,
      });
      expect(result).toEqual({ accessToken: testToken });
    });

    it('should throw an error if the user already exists', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(testUser);

      await expect(service.signUp(testRequest)).rejects.toThrow(
        'User already exists',
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: testRequest.email },
      });
    });
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      const expectedToken = 'test-token';
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(testUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.signIn(testRequest);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: testRequest.email,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: testUser.id,
        email: testUser.email,
      });
      expect(result).toEqual({ accessToken: expectedToken });
    });

    it('should throw an error if the user does not exist (wrong email)', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.signIn(testRequest)).rejects.toThrow(
        'User not found',
      );
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: testRequest.email,
        },
      });
    });

    it('should throw an error if password is incorrect', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(testUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.signIn({ ...testRequest, password: 'wrong-password' }),
      ).rejects.toThrow('Invalid password');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: testRequest.email,
        },
      });
    });
  });
});
