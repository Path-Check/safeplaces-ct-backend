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
class PublishDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { authority_name: { required: true, type: () => String }, publish_date: { required: true, type: () => Number }, info_website: { required: true, type: () => String }, concern_points: { required: true, type: () => [Object] } };
    }
}
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], PublishDto.prototype, "authority_name", void 0);
__decorate([
    class_validator_1.IsNumber(),
    __metadata("design:type", Number)
], PublishDto.prototype, "publish_date", void 0);
__decorate([
    class_validator_1.IsString(),
    __metadata("design:type", String)
], PublishDto.prototype, "info_website", void 0);
__decorate([
    class_validator_1.IsArray(),
    __metadata("design:type", Array)
], PublishDto.prototype, "concern_points", void 0);
exports.PublishDto = PublishDto;
//# sourceMappingURL=publish.dto.js.map