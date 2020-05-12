import { Repository, EntityRepository } from 'typeorm'
import { InternalServerErrorException } from '@nestjs/common'
import { SaveRedactedDto } from '../types/payload/saveRedacted.dto'
import { SaveRedactedRes } from '../types/response/saveRedacted.interface'
import { RedactedTrail } from './redactedTrail.entity'

@EntityRepository(RedactedTrail)
export class RedactedTrailRepo extends Repository<RedactedTrail> {
  async saveRedactedTrail(
    payload: SaveRedactedDto,
    user
  ): Promise<SaveRedactedRes> {
    const { identifier, trail } = payload

    const rt = new RedactedTrail()
    rt.id = identifier
    rt.orgId = user.orgId
    rt.trail = trail
    rt.userId = user.id

    try {
      await rt.save()

      return {
        data: {
          identifier: rt.id,
          organization_id: rt.orgId,
          trail: rt.trail,
          user_id: rt.userId
        },
        success: true
      }
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}
