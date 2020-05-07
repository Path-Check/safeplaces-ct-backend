import { RedactedTrail } from '../redactedTrail.interface'

export interface LoadAllRedactedRes {
  organization: {
    organization_id: string
    authority_name: string
    info_website: string
    safe_path_json: string
  }
  data: RedactedTrail[]
}
