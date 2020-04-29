import { Repository, EntityRepository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import * as node2fa from 'node-2fa'
import * as uuid from 'uuid/v4'
import { ConflictException, InternalServerErrorException } from '@nestjs/common'
import { User } from '../entities/user.entity'
import { JwtPayload } from '../../types/jwt-payload.interface'
import { RegisterDto } from 'src/auth/types/payload/register.dto'
import { ValidateDto } from 'src/auth/types/payload/validate.dto'
import { LoginDto, Login2Dto } from 'src/auth/types/payload/login.dto'
import { ChangePasswordDto } from 'src/auth/types/payload/change-password.dto'

@EntityRepository(User)
export class UserRepo extends Repository<User> {
  async register(
    registerDto: RegisterDto
  ): Promise<{
    username: string
    email: string
    admin: boolean
    role: string
    qrCodeUrl: string
  }> {
    const { username, password, email, admin, role } = registerDto

    const { secret, qr } = node2fa.generateSecret({
      name: 'Phimover',
      account: username
    })

    const user = new User()
    user.id = uuid()
    user.username = username
    user.email = email
    user.admin = admin
    user.role = role
    user.salt = await bcrypt.genSalt()
    user.password = await this.hashPassword(password, user.salt)
    user.secret2fa = secret
    user.qrCodeUrl = qr
    user.changePassword = true
    user.needs2fa = true

    try {
      await user.save()
      return {
        username,
        email: user.email,
        admin: user.admin,
        role: user.role,
        qrCodeUrl: user.qrCodeUrl
      }
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Username already exists!')
      } else {
        throw new InternalServerErrorException()
      }
    }
  }

  async validateCredentials(
    validateDto: ValidateDto
  ): Promise<{
    username: string
    needs2fa: boolean
    qrCodeUrl?: string
    secret2fa?: string
  }> {
    const { username, password } = validateDto
    const user = await this.findOne({ username })

    if (user && (await user.validatePassword(password))) {
      if (user.needs2fa) {
        return {
          username,
          needs2fa: user.needs2fa,
          qrCodeUrl: user.qrCodeUrl,
          secret2fa: user.secret2fa
        }
      } else {
        return {
          username,
          needs2fa: user.needs2fa
        }
      }
    } else {
      return null
    }
  }

  async validateLogin(loginDto: LoginDto): Promise<JwtPayload> {
    const { username, password } = loginDto
    const user = await this.findOne({ username })

    if (user && (await user.validatePassword(password))) {
      return {
        username,
        email: user.email,
        admin: user.admin,
        role: user.role,
        changePassword: user.changePassword
      }
    } else {
      return user
    }
  }

  async validateLogin2(loginDto: Login2Dto): Promise<JwtPayload> {
    const { username, password, code } = loginDto
    const user = await this.findOne({ username })
    const tokenCheck: any = node2fa.verifyToken(user.secret2fa, code, 5)

    if (
      user &&
      tokenCheck !== null &&
      (await user.validatePassword(password))
    ) {
      user.needs2fa = false
      await user.save()
      return {
        username,
        email: user.email,
        admin: user.admin,
        role: user.role,
        changePassword: user.changePassword
      }
    } else {
      return null
    }
  }

  async updatePassword(
    id: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    try {
      const user = await this.findOne({ id })
      user.password = await this.hashPassword(
        changePasswordDto.password,
        user.salt
      )
      user.changePassword = false
      await user.save()
      return {
        message: 'Successfully changed password!'
      }
    } catch (err) {
      throw err
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt)
  }
}
