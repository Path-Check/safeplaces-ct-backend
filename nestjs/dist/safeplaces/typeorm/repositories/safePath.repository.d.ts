import { Repository } from 'typeorm';
import { SafePath } from '../entities/safepath.entity';
import { PublishDto } from '../../types/payload/publish.dto';
import { PublishRes } from '../../types/response/publish.interface';
export declare class SafePathRepo extends Repository<SafePath> {
    saveSafePath(payload: PublishDto, user: any): Promise<PublishRes>;
}
