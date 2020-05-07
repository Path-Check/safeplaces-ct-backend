import { Repository, EntityRepository } from 'typeorm'
import { Organization } from './organization.entity'

@EntityRepository(Organization)
export class OrganizationRepo extends Repository<Organization> {}
