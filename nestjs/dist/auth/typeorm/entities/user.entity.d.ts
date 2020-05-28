import { BaseEntity } from 'typeorm';
export declare class User extends BaseEntity {
    id: string;
    username: string;
    password: string;
    salt: string;
    secret2fa: string;
    qrCodeUrl: string;
    email: string;
    admin: boolean;
    role: string;
    changePassword: boolean;
    needs2fa: boolean;
    validatePassword(password: string): Promise<boolean>;
}
