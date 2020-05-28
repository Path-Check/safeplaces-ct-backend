import { SafePath } from '../safePath.interface';
export interface PublishRes {
    datetime_created: Date;
    organization_id: string;
    safe_path: SafePath;
    user_id: string;
}
