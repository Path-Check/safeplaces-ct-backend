import * as uuid from 'uuid/v4'
import { Repository, EntityRepository } from 'typeorm'
import { InternalServerErrorException } from '@nestjs/common'
import { RedactedTrail } from '../entities/redactedTrail.entity'
import { SaveRedactedDto } from '../../types/payload/saveRedacted.dto'
import { SaveRedactedRes } from '../../types/response/saveRedacted.interface'

@EntityRepository(RedactedTrail)
export class RedactedTrailRepo extends Repository<RedactedTrail> {
  async saveRedactedTrail(
    payload: SaveRedactedDto,
    user
  ): Promise<SaveRedactedRes> {
    const { orgId, trail } = payload

    const rt = new RedactedTrail()
    rt.id = uuid()
    rt.orgId = orgId
    rt.trail = trail
    rt.userId = user.id

    try {
      await rt.save()

      // Returning object in their desired response format
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
