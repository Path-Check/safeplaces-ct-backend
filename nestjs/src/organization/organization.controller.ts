import { Controller, Get, Post, Put, Delete } from '@nestjs/common'

@Controller('organization')
export class OrganizationController {
  @Get('/organizations')
  getOrgs() {}

  @Post('/organizations')
  insertOrg() {}

  @Put('/organizations')
  updateOrg() {}

  @Delete('/organizations')
  deleteOrg() {}
}
