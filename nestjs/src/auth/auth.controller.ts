import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { User } from './typeorm/entities/user.entity'
import { AdminGuard } from './guards/admin'
import { ValidateDto } from './types/payload/validate.dto'
import { LoginDto, Login2Dto } from './types/payload/login.dto'
import { RegisterDto } from './types/payload/register.dto'
import { ChangePasswordDto } from './types/payload/change-password.dto'
import { GetUser } from './decorators/get-user'

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/bootstrap')
  bootstrap(): Promise<boolean> {
    return this.authService.bootstrap()
  }

  @Post('/validate')
  validate(
    @Body() validateDto: ValidateDto
  ): Promise<{
    username: string
    needs2fa: boolean
    qrCodeUrl?: string
    secret2fa?: string
  }> {
    return this.authService.validateCredentials(validateDto)
  }

  @Post('/login')
  @HttpCode(200)
  login(
    @Body() authLoginDto: LoginDto
  ): Promise<{ token: string; maps_api_key: string }> {
    return this.authService.login(authLoginDto)
  }

  @Post('/login2')
  login2(
    @Body() authLoginDto: Login2Dto
  ): Promise<{ token: string; maps_api_key: string }> {
    return this.authService.login(authLoginDto)
  }

  @Post('/register')
  @UseGuards(AuthGuard(), AdminGuard)
  register(
    @Body() registerDto: RegisterDto
  ): Promise<{ username: string; qrCodeUrl: string }> {
    return this.authService.register(registerDto)
  }

  @Post('/updatePassword')
  @UseGuards(AuthGuard())
  updatePassword(
    @GetUser() user,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    return this.authService.updatePassword(user.id, changePasswordDto)
  }

  @Get('/users')
  @UseGuards(AuthGuard(), AdminGuard)
  listUsers(): Promise<[User[], number]> {
    return this.authService.getUsers()
  }
}
