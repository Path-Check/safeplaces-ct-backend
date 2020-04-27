import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SafePlacesController } from './safeplaces.controller'
import { SafePlacesService } from './safeplaces.service'
import { RedactedTrailRepo } from './typeorm/repositories/redactedTrail.repository'
import { AuthModule } from '../auth/auth.module'
import { SafePathRepo } from './typeorm/repositories/safePath.repository'

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([RedactedTrailRepo, SafePathRepo])
  ],
  controllers: [SafePlacesController],
  providers: [SafePlacesService]
})
export class SafePlacesModule {}
