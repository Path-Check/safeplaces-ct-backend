import { BaseEntity } from 'typeorm';
import { Point } from '../../types/point.interface';
export declare class SafePath extends BaseEntity {
    id: string;
    createdAt: Date;
    orgId: string;
    authorityName: string;
    concernPoints: Point[];
    infoWebsite: string;
    publishDate: number;
    userId: string;
}
