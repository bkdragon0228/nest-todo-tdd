import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './auth.dto';

@Controller('/api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  public async signUp(@Body() request: SignUpDto) {
    return this.authService.signUp(request);
  }

  @Post('sign-in')
  public async signIn(@Body() request: SignInDto) {
    return this.authService.signIn(request);
  }
}
