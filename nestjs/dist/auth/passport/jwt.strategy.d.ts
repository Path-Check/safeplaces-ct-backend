import { JwtPayload } from '../types/jwt-payload.interface';
import { UserRepo } from '../typeorm/repositories/user.repository';
declare const JwtStrategy_base: new (...args: any[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private userRepo;
    constructor(userRepo: UserRepo);
    validate(payload: JwtPayload): Promise<import("../typeorm/entities/user.entity").User>;
}
export {};
