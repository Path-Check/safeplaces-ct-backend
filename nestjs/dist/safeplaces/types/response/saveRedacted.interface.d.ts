import { Point } from '../point.interface';
export interface SaveRedactedRes {
    data: {
        identifier: string;
        organization_id: string;
        trail: Point[];
        user_id: string;
    };
    success: true;
}
