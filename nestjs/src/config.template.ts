import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { User } from './auth/typeorm/entities/user.entity'
import { RedactedTrail } from './safeplaces/typeorm/entities/redactedTrail.entity'
import { SafePath } from './safeplaces/typeorm/entities/safepath.entity'

export const port = 3000

export const orgId = 'fakeOrganizationId'

export const maps_api_key = ''

export const jwtConfig = {
  secret: '$b8La3@fn7M!&Gato%Xag12zA4@1k#', // Please change the secret to something else that is also secure
  expiresIn: 3600 // expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
}

// Database Configuration
export const dbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres', // change to a valid username
  password: 'postgres', // change to a valid password
  database: 'safeplaces', // change to a valid database name
  // schema: 'some_schema', // uncomment and change to an existing schema if needed
  entities: [User, RedactedTrail, SafePath],
  synchronize: true // turn OFF for production
}
