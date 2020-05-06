import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { SafePlacesController } from './safeplaces.controller'
import { SafePlacesService } from './safeplaces.service'
import { RedactedTrailRepo } from './typeorm/redactedTrail.repository'
import { PublicationRepo } from './typeorm/publication.repository'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([RedactedTrailRepo, PublicationRepo])
  ],
  controllers: [SafePlacesController],
  providers: [SafePlacesService]
})
export class SafePlacesModule {}
