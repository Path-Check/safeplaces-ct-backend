import { Controller, Get, Post, Put, Delete } from '@nestjs/common'

@Controller('organizations')
export class OrganizationController {
  @Get('/')
  getOrgs() {}

  @Post('/')
  insertOrg() {}

  @Put('/:orgId')
  updateOrg() {}

  @Delete('/:orgId')
  deleteOrg() {}
}
