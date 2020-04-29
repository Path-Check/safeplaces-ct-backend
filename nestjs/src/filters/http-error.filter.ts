import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException
} from '@nestjs/common'

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const req = ctx.getRequest()
    const res = ctx.getResponse()
    const status = exception.getStatus()

    const errorRes = {
      code: status,
      timestamp: new Date().toLocaleDateString(),
      path: req.url,
      message: exception.message
    }

    res.status(status).json(errorRes)
  }
}
