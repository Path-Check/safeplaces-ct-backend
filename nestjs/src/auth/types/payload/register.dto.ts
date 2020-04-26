import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsBoolean
} from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(4)
  @MaxLength(40)
  username: string

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least 1 of each: lowercase, uppercase, and number!'
  })
  password: string

  @IsString()
  email: string

  @IsBoolean()
  admin: boolean

  @IsString()
  role: string
}
