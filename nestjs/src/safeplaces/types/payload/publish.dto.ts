import { Point } from '../point.interface'
import { IsString, IsArray } from 'class-validator'

export class PublishDto {
  @IsString()
  authority_name: string

  @IsString()
  publish_date_utc: number

  @IsString()
  info_website: string

  @IsArray()
  concern_points: Point[]
}
