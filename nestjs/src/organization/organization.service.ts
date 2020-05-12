import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { v4 as uuid } from 'uuid'
import { OrganizationRepo } from './typeorm/organization.repository'

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationRepo) private orgRepo: OrganizationRepo
  ) {}
  async insert(payload) {
    return this.orgRepo.insert({
      id: uuid(),
      authorityName: payload.authority_name,
      infoWebsite: payload.info_website,
      safePathJson: payload.safe_path_json
    })
  }
}
