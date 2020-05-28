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
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
let User = class User extends typeorm_1.BaseEntity {
    async validatePassword(password) {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, username: { required: true, type: () => String }, password: { required: true, type: () => String }, salt: { required: true, type: () => String }, secret2fa: { required: true, type: () => String }, qrCodeUrl: { required: true, type: () => String }, email: { required: true, type: () => String }, admin: { required: true, type: () => Boolean }, role: { required: true, type: () => String }, changePassword: { required: true, type: () => Boolean }, needs2fa: { required: true, type: () => Boolean } };
    }
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ name: 'username' }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    typeorm_1.Column({ name: 'password' }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    typeorm_1.Column({ name: 'salt' }),
    __metadata("design:type", String)
], User.prototype, "salt", void 0);
__decorate([
    typeorm_1.Column({ name: 'secret_2fa' }),
    __metadata("design:type", String)
], User.prototype, "secret2fa", void 0);
__decorate([
    typeorm_1.Column({ name: 'qr_code_url' }),
    __metadata("design:type", String)
], User.prototype, "qrCodeUrl", void 0);
__decorate([
    typeorm_1.Column({ name: 'email' }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    typeorm_1.Column({ name: 'admin', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "admin", void 0);
__decorate([
    typeorm_1.Column({ name: 'role', default: 'Basic' }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    typeorm_1.Column({ name: 'change_password_flag', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "changePassword", void 0);
__decorate([
    typeorm_1.Column({ name: 'needs_2fa_flag', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "needs2fa", void 0);
User = __decorate([
    typeorm_1.Entity('users'),
    typeorm_1.Unique(['username'])
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map