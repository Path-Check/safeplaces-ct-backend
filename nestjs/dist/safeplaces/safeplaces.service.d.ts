import { RedactedTrailRepo } from './typeorm/repositories/redactedTrail.repository';
import { SaveRedactedDto } from './types/payload/saveRedacted.dto';
import { SaveRedactedRes } from './types/response/saveRedacted.interface';
import { LoadRes } from './types/response/load.interface';
import { PublishDto } from './types/payload/publish.dto';
import { PublishRes } from './types/response/publish.interface';
import { SafePathRepo } from './typeorm/repositories/safePath.repository';
import { SafePath } from './typeorm/entities/safepath.entity';
export declare class SafePlacesService {
    private safePathRepo;
    private redactedTrailRepo;
    constructor(safePathRepo: SafePathRepo, redactedTrailRepo: RedactedTrailRepo);
    saveRedactedTrail(payload: SaveRedactedDto, user: any): Promise<SaveRedactedRes>;
    loadAllRedacted(user: any): Promise<LoadRes>;
    publish(payload: PublishDto, user: any): Promise<PublishRes>;
    loadSafePaths(orgId: string): Promise<{
        data: SafePath[];
    }>;
}
