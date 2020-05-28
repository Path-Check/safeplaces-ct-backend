import { Point } from './point.interface';
export interface SafePath {
    authority_name: string;
    concern_points: Point[];
    info_website: string;
    publish_date: number;
}
