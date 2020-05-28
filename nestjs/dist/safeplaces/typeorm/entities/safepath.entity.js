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
let SafePath = class SafePath extends typeorm_1.BaseEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, orgId: { required: true, type: () => String }, authorityName: { required: true, type: () => String }, concernPoints: { required: true, type: () => [Object] }, infoWebsite: { required: true, type: () => String }, publishDate: { required: true, type: () => Number }, userId: { required: true, type: () => String } };
    }
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], SafePath.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ name: 'datetime_created', nullable: true }),
    __metadata("design:type", Date)
], SafePath.prototype, "createdAt", void 0);
__decorate([
    typeorm_1.Column({ name: 'organization_id', nullable: true }),
    __metadata("design:type", String)
], SafePath.prototype, "orgId", void 0);
__decorate([
    typeorm_1.Column({ name: 'authority_name', nullable: true }),
    __metadata("design:type", String)
], SafePath.prototype, "authorityName", void 0);
__decorate([
    typeorm_1.Column({ name: 'concern_points', nullable: true, type: 'json' }),
    __metadata("design:type", Array)
], SafePath.prototype, "concernPoints", void 0);
__decorate([
    typeorm_1.Column({ name: 'info_website', nullable: true }),
    __metadata("design:type", String)
], SafePath.prototype, "infoWebsite", void 0);
__decorate([
    typeorm_1.Column({ name: 'publish_date', nullable: true }),
    __metadata("design:type", Number)
], SafePath.prototype, "publishDate", void 0);
__decorate([
    typeorm_1.Column({ name: 'user_id' }),
    __metadata("design:type", String)
], SafePath.prototype, "userId", void 0);
SafePath = __decorate([
    typeorm_1.Entity('safe_paths')
], SafePath);
exports.SafePath = SafePath;
//# sourceMappingURL=safepath.entity.js.map