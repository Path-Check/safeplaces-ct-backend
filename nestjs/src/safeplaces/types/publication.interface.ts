import { Point } from './point.interface'

export interface Publication {
  authority_name: string
  concern_points: Point[]
  info_website: string
  publish_date: number
}
