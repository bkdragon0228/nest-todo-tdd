import { Auth } from './auth.interface';

import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto implements Auth.SignUpRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class SignInDto extends SignUpDto {}
