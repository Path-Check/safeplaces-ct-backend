import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RedactedTrailRepo } from './typeorm/repositories/redactedTrail.repository'
import { RedactedTrail } from './typeorm/entities/redactedTrail.entity'
import { SaveRedactedDto } from './types/payload/saveRedacted.dto'
import { SaveRedactedRes } from './types/response/saveRedacted.interface'
import { LoadRes } from './types/response/load.interface'
import { PublishDto } from './types/payload/publish.dto'
import { PublishRes } from './types/response/publish.interface'
import { SafePathRepo } from './typeorm/repositories/safePath.repository'
import { SafePath } from './typeorm/entities/safepath.entity'

@Injectable()
export class SafePlacesService {
  constructor(
    @InjectRepository(SafePathRepo)
    private safePathRepo: SafePathRepo,
    @InjectRepository(RedactedTrailRepo)
    private redactedTrailRepo: RedactedTrailRepo
  ) {}

  async saveRedactedTrail(
    payload: SaveRedactedDto,
    user
  ): Promise<SaveRedactedRes> {
    return await this.redactedTrailRepo.saveRedactedTrail(payload, user)
  }

  async loadAllRedacted(user): Promise<LoadRes> {
    const results: RedactedTrail[] = await this.redactedTrailRepo.find()
    const data = results.map(rt => ({
      identifier: rt.id,
      organization_id: rt.orgId,
      trail: rt.trail,
      user_id: user.id
    }))

    return { data }
  }

  async publish(payload: PublishDto, user): Promise<PublishRes> {
    return await this.safePathRepo.saveSafePath(payload, user)
  }

  // If data is an array
  async loadSafePaths(orgId: string) {
    const data: SafePath[] = await this.safePathRepo.find({ where: { orgId } })
    return { data }
  }
}
