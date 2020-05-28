"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_repository_1 = require("./typeorm/repositories/user.repository");
const config_1 = require("../config");
let AuthService = class AuthService {
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async bootstrap() {
        try {
            await this.userRepo.register({
                username: 'tester',
                password: 'tester54321',
                email: 'tester@tester.com',
                admin: true,
                role: 'Default'
            });
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async register(authRegisterDto) {
        return await this.userRepo.register(authRegisterDto);
    }
    async validateCredentials(validateDto) {
        const user = await this.userRepo.validateCredentials(validateDto);
        if (!user.username) {
            throw new common_1.UnauthorizedException('Invalid credentials!');
        }
        return user;
    }
    async login(loginDto) {
        const payload = await this.userRepo.validateLogin(loginDto);
        if (!payload.username) {
            throw new common_1.UnauthorizedException('Invalid credentials!');
        }
        const token = await this.jwtService.sign(payload);
        return { token, maps_api_key: config_1.maps_api_key };
    }
    async login2(loginDto) {
        const payload = await this.userRepo.validateLogin2(loginDto);
        if (!payload.username) {
            throw new common_1.UnauthorizedException('Invalid credentials!');
        }
        const token = await this.jwtService.sign(payload);
        return { token, maps_api_key: config_1.maps_api_key };
    }
    async getUsers() {
        return await this.userRepo
            .createQueryBuilder('user')
            .select([
            'user.username',
            'user.email',
            'user.admin',
            'user.role',
            'user.changePassword',
            'user.needs2fa'
        ])
            .getManyAndCount();
    }
    async updatePassword(id, changePasswordDto) {
        return await this.userRepo.updatePassword(id, changePasswordDto);
    }
};
AuthService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(user_repository_1.UserRepo)),
    __metadata("design:paramtypes", [user_repository_1.UserRepo,
        jwt_1.JwtService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map