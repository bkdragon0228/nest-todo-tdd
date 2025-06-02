import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const accessToken = this.getBearerToken(request);

      if (!accessToken) {
        throw new UnauthorizedException('No access token');
      }

      const { id, email } = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET') || 'secret',
      });

      const user = await this.prisma.user.findUnique({
        select: {
          id: true,
          email: true,
        },
        where: {
          id,
          email,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user;

      return user ? true : false;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  private getBearerToken(request: any): string | null {
    let authHeader = request.headers['x-user'];
    authHeader = authHeader ?? request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}
