import { v4 as uuid } from 'uuid'
import { Repository, EntityRepository } from 'typeorm'
import { InternalServerErrorException } from '@nestjs/common'
import { Publication } from './publication.entity'
import { PublishDto } from '../types/payload/publish.dto'
import { PublishRes } from '../types/response/publish.interface'

@EntityRepository(Publication)
export class PublicationRepo extends Repository<Publication> {
  async publish(payload: PublishDto, user): Promise<PublishRes> {
    const {
      authority_name,
      publish_date,
      info_website,
      start_date,
      end_date
    } = payload

    const sp = new Publication()
    sp.id = uuid()
    sp.orgId = user.organization_id
    sp.infoWebsite = info_website
    sp.authorityName = authority_name
    sp.startDate = start_date
    sp.endDate = end_date
    sp.publishDate = publish_date
    sp.userId = user.id
    sp.createdAt = new Date()

    try {
      await sp.save()
      return {
        datetime_created: sp.createdAt,
        organization_id: sp.orgId,
        safe_path: {
          authority_name: sp.authorityName,
          concern_points: sp.concernPoints,
          info_website: sp.infoWebsite,
          publish_date: sp.publishDate
        },
        user_id: user.id
      }
    } catch (err) {
      throw new InternalServerErrorException()
    }
  }
}
