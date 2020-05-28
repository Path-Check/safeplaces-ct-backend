import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export declare const port: number;
export declare const orgId: string;
export declare const maps_api_key: string;
export declare const jwtConfig: {
    secret: string;
    expiresIn: string;
};
export declare const dbConfig: TypeOrmModuleOptions;
