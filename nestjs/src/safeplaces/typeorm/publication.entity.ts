import { BaseEntity, PrimaryColumn, Column, Entity } from 'typeorm'
import { Point } from '../types/point.interface'

@Entity('publications')
export class Publication extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'datetime_created', nullable: true, type: 'timestamp' })
  createdAt: Date

  @Column({ name: 'organization_id', nullable: true, type: 'text' })
  orgId: string

  @Column({ name: 'authority_name', nullable: true, type: 'text' })
  authorityName: string

  @Column({ name: 'start_date', nullable: true, type: 'integer' })
  startDate: number

  @Column({ name: 'end_date', nullable: true, type: 'integer' })
  endDate: number

  @Column({ name: 'info_website', nullable: true, type: 'text' })
  infoWebsite: string

  @Column({ name: 'publish_date', nullable: true, type: 'integer' })
  publishDate: number

  @Column({ name: 'concern_points', nullable: true, type: 'json' })
  concernPoints: Point[]

  @Column({ name: 'user_id' })
  userId: string
}
