/* eslint-disable prettier/prettier */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Request } from 'express';

interface User {
  usertype: string;
  // add other user properties if needed
}

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<string[]>(
    ROLES_KEY,
    [context.getHandler(), context.getClass()],
  );

  if (!requiredRoles) {
    return true; // No role required
  }

  const request = context.switchToHttp().getRequest<RequestWithUser>();
 console.log(' Request.user in RolesGuard:', request.user);

  const user = request.user;
  console.log(' User in RolesGuard:', user);
  console.log(' Required Roles:', requiredRoles);

  if (!user || !user.usertype) {
    throw new ForbiddenException('User or usertype missing from request');
  }

  if (!requiredRoles.includes(user.usertype)) {
    throw new ForbiddenException('Access denied. You lack required role.');
  }

  return true;
}
}