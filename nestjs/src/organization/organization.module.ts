import { Module } from '@nestjs/common'
import { OrganizationController } from './organization.controller'
import { OrganizationService } from './organization.service'

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService]
})
export class OrganizationModule {}
