import { Point } from './point.interface';
export interface RedactedTrail {
    identifier: string;
    organization_id: string;
    trail: Point[];
    user_id: string;
}
