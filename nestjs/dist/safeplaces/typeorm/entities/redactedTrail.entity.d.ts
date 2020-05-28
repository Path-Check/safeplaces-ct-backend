import { BaseEntity } from 'typeorm';
import { Point } from '../../types/point.interface';
export declare class RedactedTrail extends BaseEntity {
    id: string;
    orgId: string;
    trail: Point[];
    userId: string;
}
