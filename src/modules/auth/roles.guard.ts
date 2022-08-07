import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { JwtService } from '@nestjs/jwt';
import { Roles, ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    
    const req = context.switchToHttp().getRequest();

    const tokenInfo = this.jwtService.decode(req.headers.token) as any;
    if (tokenInfo) {
      const { roles, userId } = tokenInfo;
      req.uid = userId;
      if (roles.some(role => role === Role.Admin)) {
        return true;
      } else {
        return requiredRoles.some(role => roles.includes(role));
      }
    } else {
      return false;
    }
  }
}
