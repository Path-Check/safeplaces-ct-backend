import { IsString, IsArray } from 'class-validator'
import { Point } from '../point.interface'

export class SaveRedactedDto {
  @IsString()
  orgId: string

  @IsArray()
  trail: Point[]
}
