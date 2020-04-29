import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_FILTER } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { SafePlacesModule } from './safeplaces/safeplaces.module'
import { dbConfig } from './config'

@Module({
  imports: [TypeOrmModule.forRoot(dbConfig), AuthModule, SafePlacesModule],
  controllers: [],
  providers: []
})
export class AppModule {}
