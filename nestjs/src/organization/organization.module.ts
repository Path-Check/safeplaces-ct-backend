import { Module } from '@nestjs/common'
import { OrganizationController } from './organization.controller'
import { OrganizationService } from './organization.service'
import { OrganizationRepo } from './typeorm/organization.repository'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationRepo])],
  controllers: [OrganizationController],
  providers: [OrganizationService]
})
export class OrganizationModule {}
