import { SafePlacesService } from './safeplaces.service';
import { SaveRedactedDto } from './types/payload/saveRedacted.dto';
import { SaveRedactedRes } from './types/response/saveRedacted.interface';
import { LoadRes } from './types/response/load.interface';
import { PublishDto } from './types/payload/publish.dto';
import { PublishRes } from './types/response/publish.interface';
import { SafePathsJsonRes } from './types/response/safePathsJson.interface';
export declare class SafePlacesController {
    private safePlacesService;
    constructor(safePlacesService: SafePlacesService);
    saveRedactedTrail(payload: SaveRedactedDto, user: any): Promise<SaveRedactedRes>;
    loadAllRedacted(user: any): Promise<LoadRes>;
    publish(payload: PublishDto, user: any): Promise<PublishRes>;
    loadSafePathJson(orgId: any): Promise<SafePathsJsonRes>;
}
