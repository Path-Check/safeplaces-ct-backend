import { Repository } from 'typeorm';
import { RedactedTrail } from '../entities/redactedTrail.entity';
import { SaveRedactedDto } from '../../types/payload/saveRedacted.dto';
import { SaveRedactedRes } from '../../types/response/saveRedacted.interface';
export declare class RedactedTrailRepo extends Repository<RedactedTrail> {
    saveRedactedTrail(payload: SaveRedactedDto, user: any): Promise<SaveRedactedRes>;
}
