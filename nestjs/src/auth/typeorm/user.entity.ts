import { BaseEntity, PrimaryColumn, Column, Entity, Unique } from 'typeorm'
import * as bcrypt from 'bcrypt'

@Entity('users')
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'username', type: 'text' })
  username: string

  @Column({ name: 'password', type: 'text' })
  password: string

  @Column({ name: 'salt', type: 'text' })
  salt: string

  @Column({ name: 'secret_2fa', type: 'text' })
  secret2fa: string

  @Column({ name: 'qr_code_url', type: 'text' })
  qrCodeUrl: string

  @Column({ name: 'email', type: 'text' })
  email: string

  @Column({ name: 'admin', default: false, type: 'boolean' })
  admin: boolean

  @Column({ name: 'role', default: 'Basic', type: 'text' })
  role: string

  @Column({ name: 'change_password_flag', default: true, type: 'boolean' })
  changePassword: boolean

  @Column({ name: 'needs_2fa_flag', default: true, type: 'boolean' })
  needs2fa: boolean

  @Column({ name: 'organization_id', nullable: true, type: 'text' })
  orgId: string

  async validatePassword(password: string) {
    const hash = await bcrypt.hash(password, this.salt)
    return hash === this.password
  }
}
