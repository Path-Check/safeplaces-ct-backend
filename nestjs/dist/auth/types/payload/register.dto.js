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
const class_validator_1 = require("class-validator");
class RegisterDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { username: { required: true, type: () => String, minLength: 4, maxLength: 40 }, password: { required: true, type: () => String, minLength: 8, maxLength: 20 }, email: { required: true, type: () => String }, admin: { required: true, type: () => Boolean }, role: { required: true, type: () => String } };
    }
}
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MinLength(4),
    class_validator_1.MaxLength(40),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    class_validator_1.IsString(),
    class_validator_1.MinLength(8),
    class_validator_1.MaxLength(20),
    class_validator_1.Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password must contain at least 1 of each: lowercase, uppercase, and number!'
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    class_validator_1.IsBoolean(),
    __metadata("design:type", Boolean)
], RegisterDto.prototype, "admin", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
exports.RegisterDto = RegisterDto;
//# sourceMappingURL=register.dto.js.map