import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { User } from './auth/typeorm/entities/user.entity'
import { SafePath } from './safeplaces/typeorm/entities/safepath.entity'
import { RedactedTrail } from './safeplaces/typeorm/entities/redactedTrail.entity'

export const port = parseInt(process.env.PORT) || 3000

export const orgId = process.env.ORG_ID || ''

export const maps_api_key = process.env.GOOGLE_MAP_API_KEY || '' // insert valid Google Map API Key

export const jwtConfig = {
  secret: process.env.JWT_SECRET || null,
  expiresIn: process.env.JWT_DURATION || '1 hour' // expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
}

// Database Configuration
export const dbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'safeplaces',
  // schema: process.env.DB_SCHEMA, // uncomment if needed
  entities: [User, SafePath, RedactedTrail],
  synchronize: true // turn OFF for production
}
