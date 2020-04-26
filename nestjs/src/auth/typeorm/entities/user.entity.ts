import { BaseEntity, PrimaryColumn, Column, Entity, Unique } from 'typeorm'
import * as bcrypt from 'bcrypt'

@Entity('users')
@Unique(['username'])
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column({ name: 'username' })
  username: string

  @Column({ name: 'password' })
  password: string

  @Column({ name: 'salt' })
  salt: string

  @Column({ name: 'secret_2fa' })
  secret2fa: string

  @Column({ name: 'qr_code_url' })
  qrCodeUrl: string

  @Column({ name: 'email' })
  email: string

  @Column({ name: 'admin', default: false })
  admin: boolean

  @Column({ name: 'role', default: 'Basic' })
  role: string

  @Column({ name: 'change_password_flag', default: true })
  changePassword: boolean

  @Column({ name: 'needs_2fa_flag', default: true })
  needs2fa: boolean

  async validatePassword(password: string) {
    const hash = await bcrypt.hash(password, this.salt)
    return hash === this.password
  }
}
