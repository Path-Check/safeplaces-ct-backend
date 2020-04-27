import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common'

@Injectable()
export class NormalizeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const { headers, body } = context.switchToHttp().getRequest()

    if (headers['content-type'] === 'application/x-www-form-urlencoded') {
      headers['content-type'] = 'application/json'
      context.switchToHttp().getRequest().body = JSON.parse(
        Object.keys(body)[0]
      )
    }
    return next.handle()
  }
}
