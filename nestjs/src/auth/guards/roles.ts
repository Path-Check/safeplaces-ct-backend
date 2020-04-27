import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!roles) {
      return true
    }
    const request = context.switchToHttp().getRequest()
    const { authorization } = request.headers
    const jwt = new JwtService({})
    const token = authorization.split(' ')[1]
    const user: any = jwt.decode(token)
    const hasRole = () => roles.includes(user.role)
    return user && hasRole()
  }
}
