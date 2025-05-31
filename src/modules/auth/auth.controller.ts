import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth } from './auth.type';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  public async signUp(@Body() request: Auth.SignUpRequest) {
    return this.authService.signUp(request);
  }

  @Post('sign-in')
  public async signIn(@Body() request: Auth.SignInRequest) {
    return this.authService.signIn(request);
  }
}
