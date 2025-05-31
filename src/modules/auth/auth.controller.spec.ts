import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth } from './auth.type';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  let request: Auth.SignUpRequest;
  let response: Auth.SignUpResponse;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthController,
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    request = {
      email: 'test@test.com',
      password: 'password',
    };

    response = {
      accessToken: 'test-token',
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('should sign up a user', async () => {
      jest.spyOn(service, 'signUp').mockResolvedValue(response);

      const result = await controller.signUp(request);

      expect(service.signUp).toHaveBeenCalledWith(request);
      expect(result).toEqual(response);
    });
  });

  describe('signIn', () => {
    it('should sign in a user', async () => {
      jest.spyOn(service, 'signIn').mockResolvedValue(response);

      const result = await controller.signIn(request);

      expect(service.signIn).toHaveBeenCalledWith(request);
      expect(result).toEqual(response);
    });
  });
});
