import { Entity, BaseEntity, PrimaryColumn, Column } from 'typeorm'

@Entity('organizations')
export class Organization extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'authority_name', type: 'text' })
  authorityName: string

  @Column({ name: 'info_website', type: 'text' })
  infoWebsite: string

  @Column({ name: 'safe_path_json', type: 'text' })
  safePathJson: string
}
