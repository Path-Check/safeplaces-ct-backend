import { PassportStrategy } from '@nestjs/passport'
import { UnauthorizedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { jwtConfig } from '../../config'
import { JwtPayload } from '../types/jwt-payload.interface'
import { UserRepo } from '../typeorm/user.repository'

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepo)
    private userRepo: UserRepo
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.secret
    })
  }
  async validate(payload: JwtPayload) {
    const { username } = payload
    const user = await this.userRepo.findOne({ username })

    if (!user) {
      throw new UnauthorizedException('Not logged in')
    }

    return user
  }
}
