import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Auth } from './auth.type';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public async signUp(
    request: Auth.SignUpRequest,
  ): Promise<Auth.SignUpResponse> {
    const user = await this.findUserByEmail(request.email);

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: request.email,
        password: hashedPassword,
      },
    });

    const accessToken = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
    });

    return {
      accessToken,
    };
  }

  public async signIn(
    request: Auth.SignInRequest,
  ): Promise<Auth.SignUpResponse> {
    const user = await this.findUserByEmail(request.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      request.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
    };
  }

  private async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}
