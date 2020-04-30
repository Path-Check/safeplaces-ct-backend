import { IsString, IsArray } from 'class-validator'
import { Point } from '../point.interface'

export class SaveRedactedDto {
  @IsString()
  identifier: string

  @IsArray()
  trail: Point[]
}
