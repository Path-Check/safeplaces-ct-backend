import { Point } from '../point.interface'
import { IsString, IsArray, IsNumber } from 'class-validator'

export class PublishDto {
  @IsString()
  authority_name: string

  @IsNumber()
  publish_date: number

  @IsString()
  info_website: string

  @IsArray()
  concern_points: Point[]
}
