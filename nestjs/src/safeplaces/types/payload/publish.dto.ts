import { IsString, IsNumber } from 'class-validator'

export class PublishDto {
  @IsString()
  authority_name: string

  @IsNumber()
  publish_date: number

  @IsString()
  info_website: string

  @IsString()
  safe_path_json: string

  @IsNumber()
  start_date: number

  @IsNumber()
  end_date: number
}
