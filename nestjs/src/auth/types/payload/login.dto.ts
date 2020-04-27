import { IsString } from 'class-validator'

export class LoginDto {
  @IsString()
  username: string

  @IsString()
  password: string
}

export class Login2Dto {
  @IsString()
  username: string

  @IsString()
  password: string

  @IsString()
  code: string
}
