import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { SafePlacesModule } from './safeplaces/safeplaces.module'
import { dbConfig } from './config'
import { OrganizationModule } from './organization/organization.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(dbConfig),
    AuthModule,
    SafePlacesModule,
    OrganizationModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
