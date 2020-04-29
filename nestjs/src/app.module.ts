import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { APP_FILTER } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { SafePlacesModule } from './safeplaces/safeplaces.module'
import { dbConfig } from './config'
import { HttpErrorFilter } from './filters/http-error.filter'

@Module({
  imports: [TypeOrmModule.forRoot(dbConfig), AuthModule, SafePlacesModule],
  controllers: [],
  providers: [{ provide: APP_FILTER, useClass: HttpErrorFilter }]
})
export class AppModule {}
