export interface JwtPayload {
  username: string
  email: string
  admin: boolean
  role: string
  changePassword: boolean
  organization_id: string
}
