import { AuthService } from './auth.service';
import { User } from './typeorm/entities/user.entity';
import { ValidateDto } from './types/payload/validate.dto';
import { LoginDto, Login2Dto } from './types/payload/login.dto';
import { RegisterDto } from './types/payload/register.dto';
import { ChangePasswordDto } from './types/payload/change-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    bootstrap(): Promise<boolean>;
    validate(validateDto: ValidateDto): Promise<{
        username: string;
        needs2fa: boolean;
        qrCodeUrl?: string;
        secret2fa?: string;
    }>;
    login(authLoginDto: LoginDto): Promise<{
        token: string;
        maps_api_key: string;
    }>;
    login2(authLoginDto: Login2Dto): Promise<{
        token: string;
        maps_api_key: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        username: string;
        qrCodeUrl: string;
    }>;
    updatePassword(user: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    listUsers(): Promise<[User[], number]>;
}
