import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common'
import { SafePlacesService } from './safeplaces.service'
import { GetUser } from '../auth/decorators/get-user'
import { SaveRedactedDto } from './types/payload/saveRedacted.dto'
import { SaveRedactedRes } from './types/response/saveRedacted.interface'
import { LoadRes } from './types/response/load.interface'
import { PublishDto } from './types/payload/publish.dto'
import { PublishRes } from './types/response/publish.interface'
import { SafePathsJsonRes } from './types/response/safePathsJson.interface'
import { AuthGuard } from '@nestjs/passport'

@Controller()
export class SafePlacesController {
  constructor(private safePlacesService: SafePlacesService) {}

  // https://github.com/tripleblindmarket/safe-places/blob/develop/Safe-Places-Server.md#save-redacted
  @Post('/redacted_trail')
  @UseGuards(AuthGuard)
  saveRedactedTrail(
    @Body() payload: SaveRedactedDto,
    @GetUser() user // TODO: needs type, we also need to decide if this comes from the logged in user, or something else
  ): Promise<SaveRedactedRes> {
    return this.safePlacesService.saveRedactedTrail(payload, user)
  }

  //https://github.com/tripleblindmarket/safe-places/blob/develop/Safe-Places-Server.md#load-all-redacted
  @Get('/redacted_trail')
  @UseGuards(AuthGuard)
  loadAllRedacted(@GetUser() user): Promise<LoadRes> {
    return this.safePlacesService.loadAllRedacted(user)
  }

  //https://github.com/tripleblindmarket/safe-places/blob/develop/Safe-Places-Server.md#publish
  @Post('/safe_paths')
  @UseGuards(AuthGuard)
  publish(@Body() payload: PublishDto, @GetUser() user): Promise<PublishRes> {
    return this.safePlacesService.publish(payload, user)
  }

  //https://github.com/tripleblindmarket/safe-places/blob/develop/Safe-Places-Server.md#safe-paths.json
  @Get('/safe_paths/:orgId')
  loadSafePathJson(@Param('orgId') orgId): Promise<SafePathsJsonRes> {
    return this.safePlacesService.loadSafePaths(orgId)
  }
}
