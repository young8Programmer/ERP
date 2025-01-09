import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Token mavjud emas');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token formati noto‘g‘ri');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = payload
      request.teacher = payload
      
      return true;
    } catch (error) {
      console.error('JWT tekshirish xatosi:', error);

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token muddati tugagan');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token noto‘g‘ri');
      }

      throw new UnauthorizedException('Autentifikatsiya muvaffaqiyatsiz tugadi');
    }
  }
}
