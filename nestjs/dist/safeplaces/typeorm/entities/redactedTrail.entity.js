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
let RedactedTrail = class RedactedTrail extends typeorm_1.BaseEntity {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, orgId: { required: true, type: () => String }, trail: { required: true, type: () => [Object] }, userId: { required: true, type: () => String } };
    }
};
__decorate([
    typeorm_1.PrimaryColumn(),
    __metadata("design:type", String)
], RedactedTrail.prototype, "id", void 0);
__decorate([
    typeorm_1.Column({ name: 'org_id', nullable: true }),
    __metadata("design:type", String)
], RedactedTrail.prototype, "orgId", void 0);
__decorate([
    typeorm_1.Column({ name: 'trail', nullable: true, type: 'json' }),
    __metadata("design:type", Array)
], RedactedTrail.prototype, "trail", void 0);
__decorate([
    typeorm_1.Column({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], RedactedTrail.prototype, "userId", void 0);
RedactedTrail = __decorate([
    typeorm_1.Entity('redacted_trails')
], RedactedTrail);
exports.RedactedTrail = RedactedTrail;
//# sourceMappingURL=redactedTrail.entity.js.map