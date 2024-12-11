import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles || !user) {
      throw new UnauthorizedException('Foydalanuvchi autentifikatsiya qilinmagan yoki rol etishmayapti');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new UnauthorizedException('You are not allowed');
    }

    return true;
  }
}
