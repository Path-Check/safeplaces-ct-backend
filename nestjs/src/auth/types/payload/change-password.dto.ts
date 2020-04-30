import { IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain at least 1 of each: lowercase, uppercase, and number!'
  })
  password: string
}
