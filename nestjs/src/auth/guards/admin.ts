import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const { authorization } = request.headers
    const jwt = new JwtService({})
    const token = authorization.split(' ')[1]
    const user: any = jwt.decode(token)
    return user && user.admin
  }
}
