"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const node2fa = require("node-2fa");
const uuid = require("uuid/v4");
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../entities/user.entity");
const register_dto_1 = require("../../types/payload/register.dto");
const validate_dto_1 = require("../../types/payload/validate.dto");
const login_dto_1 = require("../../types/payload/login.dto");
const change_password_dto_1 = require("../../types/payload/change-password.dto");
let UserRepo = class UserRepo extends typeorm_1.Repository {
    async register(registerDto) {
        const { username, password, email, admin, role } = registerDto;
        const { secret, qr } = node2fa.generateSecret({
            name: 'Phimover',
            account: username
        });
        const user = new user_entity_1.User();
        user.id = uuid();
        user.username = username;
        user.email = email;
        user.admin = admin;
        user.role = role;
        user.salt = await bcrypt.genSalt();
        user.password = await this.hashPassword(password, user.salt);
        user.secret2fa = secret;
        user.qrCodeUrl = qr;
        user.changePassword = true;
        user.needs2fa = true;
        try {
            await user.save();
            return {
                username,
                email: user.email,
                admin: user.admin,
                role: user.role,
                qrCodeUrl: user.qrCodeUrl
            };
        }
        catch (err) {
            if (err.code === '23505') {
                throw new common_1.ConflictException('Username already exists!');
            }
            else {
                throw new common_1.InternalServerErrorException();
            }
        }
    }
    async validateCredentials(validateDto) {
        const { username, password } = validateDto;
        const user = await this.findOne({ username });
        if (user && (await user.validatePassword(password))) {
            if (user.needs2fa) {
                return {
                    username,
                    needs2fa: user.needs2fa,
                    qrCodeUrl: user.qrCodeUrl,
                    secret2fa: user.secret2fa
                };
            }
            else {
                return {
                    username,
                    needs2fa: user.needs2fa
                };
            }
        }
        else {
            return null;
        }
    }
    async validateLogin(loginDto) {
        const { username, password } = loginDto;
        const user = await this.findOne({ username });
        if (user && (await user.validatePassword(password))) {
            return {
                username,
                email: user.email,
                admin: user.admin,
                role: user.role,
                changePassword: user.changePassword
            };
        }
        else {
            return null;
        }
    }
    async validateLogin2(loginDto) {
        const { username, password, code } = loginDto;
        const user = await this.findOne({ username });
        const tokenCheck = node2fa.verifyToken(user.secret2fa, code, 5);
        if (user &&
            tokenCheck !== null &&
            (await user.validatePassword(password))) {
            user.needs2fa = false;
            await user.save();
            return {
                username,
                email: user.email,
                admin: user.admin,
                role: user.role,
                changePassword: user.changePassword
            };
        }
        else {
            return null;
        }
    }
    async updatePassword(id, changePasswordDto) {
        try {
            const user = await this.findOne({ id });
            user.password = await this.hashPassword(changePasswordDto.password, user.salt);
            user.changePassword = false;
            await user.save();
            return {
                message: 'Successfully changed password!'
            };
        }
        catch (err) {
            throw err;
        }
    }
    async hashPassword(password, salt) {
        return await bcrypt.hash(password, salt);
    }
};
UserRepo = __decorate([
    typeorm_1.EntityRepository(user_entity_1.User)
], UserRepo);
exports.UserRepo = UserRepo;
//# sourceMappingURL=user.repository.js.map