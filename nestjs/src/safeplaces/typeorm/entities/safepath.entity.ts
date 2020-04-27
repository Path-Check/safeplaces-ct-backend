import { BaseEntity, PrimaryColumn, Column, Entity } from 'typeorm'
import { Point } from '../../types/point.interface'

@Entity('safe_paths')
export class SafePath extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'datetime_created', nullable: true })
  createdAt: Date

  @Column({ name: 'organization_id', nullable: true })
  orgId: string

  @Column({ name: 'authority_name', nullable: true })
  authorityName: string

  @Column({ name: 'concern_points', nullable: true, type: 'json' })
  concernPoints: Point[]

  @Column({ name: 'info_website', nullable: true })
  infoWebsite: string

  @Column({ name: 'publish_date', nullable: true })
  publishDate: number

  @Column({ name: 'user_id' })
  userId: string
}
