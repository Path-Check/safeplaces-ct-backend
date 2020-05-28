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
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const admin_1 = require("./guards/admin");
const validate_dto_1 = require("./types/payload/validate.dto");
const login_dto_1 = require("./types/payload/login.dto");
const register_dto_1 = require("./types/payload/register.dto");
const change_password_dto_1 = require("./types/payload/change-password.dto");
const get_user_1 = require("./decorators/get-user");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    bootstrap() {
        return this.authService.bootstrap();
    }
    validate(validateDto) {
        return this.authService.validateCredentials(validateDto);
    }
    login(authLoginDto) {
        console.log('dto', authLoginDto);
        return this.authService.login(authLoginDto);
    }
    login2(authLoginDto) {
        return this.authService.login(authLoginDto);
    }
    register(registerDto) {
        return this.authService.register(registerDto);
    }
    updatePassword(user, changePasswordDto) {
        return this.authService.updatePassword(user.id, changePasswordDto);
    }
    listUsers() {
        return this.authService.getUsers();
    }
};
__decorate([
    common_1.Get('/bootstrap'),
    openapi.ApiResponse({ status: 200, type: Boolean }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "bootstrap", null);
__decorate([
    common_1.Post('/validate'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_dto_1.ValidateDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validate", null);
__decorate([
    common_1.Post('/login'),
    common_1.HttpCode(200),
    openapi.ApiResponse({ status: 200 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    common_1.Post('/login2'),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.Login2Dto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login2", null);
__decorate([
    common_1.Post('/register'),
    common_1.UseGuards(passport_1.AuthGuard(), admin_1.AdminGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    common_1.Post('/updatePassword'),
    common_1.UseGuards(passport_1.AuthGuard()),
    openapi.ApiResponse({ status: 201 }),
    __param(0, get_user_1.GetUser()),
    __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updatePassword", null);
__decorate([
    common_1.Get('/users'),
    common_1.UseGuards(passport_1.AuthGuard(), admin_1.AdminGuard),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listUsers", null);
AuthController = __decorate([
    common_1.Controller(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map