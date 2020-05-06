import { Publication } from '../publication.interface'

export interface PublishRes {
  datetime_created: Date
  organization_id: string
  safe_path: Publication
  user_id: string
}
