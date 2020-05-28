import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../../types/jwt-payload.interface';
import { RegisterDto } from 'src/auth/types/payload/register.dto';
import { ValidateDto } from 'src/auth/types/payload/validate.dto';
import { LoginDto, Login2Dto } from 'src/auth/types/payload/login.dto';
import { ChangePasswordDto } from 'src/auth/types/payload/change-password.dto';
export declare class UserRepo extends Repository<User> {
    register(registerDto: RegisterDto): Promise<{
        username: string;
        email: string;
        admin: boolean;
        role: string;
        qrCodeUrl: string;
    }>;
    validateCredentials(validateDto: ValidateDto): Promise<{
        username: string;
        needs2fa: boolean;
        qrCodeUrl?: string;
        secret2fa?: string;
    }>;
    validateLogin(loginDto: LoginDto): Promise<JwtPayload>;
    validateLogin2(loginDto: Login2Dto): Promise<JwtPayload>;
    updatePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    private hashPassword;
}
