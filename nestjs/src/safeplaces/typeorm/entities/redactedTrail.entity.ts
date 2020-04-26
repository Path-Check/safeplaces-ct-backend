import { BaseEntity, PrimaryColumn, Column, Entity } from 'typeorm'
import { Point } from '../../types/point.interface'

@Entity('redacted_trails')
export class RedactedTrail extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'org_id', nullable: true })
  orgId: string

  @Column({ name: 'trail', nullable: true, type: 'json' })
  trail: Point[]

  @Column({ name: 'user_id', nullable: true })
  userId: string
}
