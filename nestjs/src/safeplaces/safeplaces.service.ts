import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RedactedTrailRepo } from './typeorm/redactedTrail.repository'
import { RedactedTrail } from './typeorm/redactedTrail.entity'
import { SaveRedactedDto } from './types/payload/saveRedacted.dto'
import { SaveRedactedRes } from './types/response/saveRedacted.interface'
import { LoadAllRedactedRes } from './types/response/loadAllRedacted.interface'
import { PublishDto } from './types/payload/publish.dto'
import { PublishRes } from './types/response/publish.interface'
import { Publication } from './typeorm/publication.entity'
import { PublicationRepo } from './typeorm/publication.repository'
import { SafePathsJsonRes } from './types/response/safePathsJson.interface'
import { OrganizationRepo } from 'src/organization/typeorm/organization.repository'
import { Organization } from 'src/organization/typeorm/organization.entity'

@Injectable()
export class SafePlacesService {
  constructor(
    @InjectRepository(PublicationRepo)
    private publicationRepo: PublicationRepo,
    @InjectRepository(RedactedTrailRepo)
    private redactedTrailRepo: RedactedTrailRepo,
    @InjectRepository(OrganizationRepo)
    private orgRepo: OrganizationRepo
  ) {}

  async saveRedactedTrail(
    payload: SaveRedactedDto,
    user
  ): Promise<SaveRedactedRes> {
    return await this.redactedTrailRepo.saveRedactedTrail(payload, user)
  }

  async loadAllRedacted(user): Promise<LoadAllRedactedRes> {
    const results: RedactedTrail[] = await this.redactedTrailRepo.find()
    // TODO: Add Organization Module to manage orgs or add one org as .env vars (Maybe HA's only use one?)
    const org: Organization = await this.orgRepo.findOne(user.orgId)

    const organization = {
      organization_id: org.id,
      authority_name: org.authorityName,
      info_website: org.infoWebsite,
      safe_path_json: org.safePathJson
    }

    const data = results.map(rt => ({
      identifier: rt.id,
      organization_id: rt.orgId,
      trail: rt.trail,
      user_id: user.id
    }))

    return { organization, data }
  }

  async publish(payload: PublishDto, user): Promise<PublishRes> {
    return await this.publicationRepo.publish(payload, user)
  }

  async loadSafePaths(orgId: string): Promise<SafePathsJsonRes> {
    const pub: Publication = await this.publicationRepo.findOne({
      where: { orgId },
      order: { publishDate: 'DESC' }
    })
    return {
      authority_name: pub.authorityName,
      concern_points: pub.concernPoints,
      info_website: pub.infoWebsite,
      publish_date: pub.publishDate
    }
  }
}
