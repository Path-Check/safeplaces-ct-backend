import { JwtService } from '@nestjs/jwt';
import { UserRepo } from './typeorm/repositories/user.repository';
import { RegisterDto } from './types/payload/register.dto';
import { LoginDto, Login2Dto } from './types/payload/login.dto';
import { ValidateDto } from './types/payload/validate.dto';
import { User } from './typeorm/entities/user.entity';
import { ChangePasswordDto } from './types/payload/change-password.dto';
export declare class AuthService {
    private userRepo;
    private jwtService;
    constructor(userRepo: UserRepo, jwtService: JwtService);
    bootstrap(): Promise<boolean>;
    register(authRegisterDto: RegisterDto): Promise<{
        username: string;
        qrCodeUrl: string;
    }>;
    validateCredentials(validateDto: ValidateDto): Promise<{
        username: string;
        needs2fa: boolean;
        qrCodeUrl?: string;
        secret2fa?: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        token: string;
        maps_api_key: string;
    }>;
    login2(loginDto: Login2Dto): Promise<{
        token: string;
        maps_api_key: string;
    }>;
    getUsers(): Promise<[User[], number]>;
    updatePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
