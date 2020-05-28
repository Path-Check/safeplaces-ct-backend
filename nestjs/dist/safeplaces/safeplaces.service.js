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
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const redactedTrail_repository_1 = require("./typeorm/repositories/redactedTrail.repository");
const safePath_repository_1 = require("./typeorm/repositories/safePath.repository");
let SafePlacesService = class SafePlacesService {
    constructor(safePathRepo, redactedTrailRepo) {
        this.safePathRepo = safePathRepo;
        this.redactedTrailRepo = redactedTrailRepo;
    }
    async saveRedactedTrail(payload, user) {
        return await this.redactedTrailRepo.saveRedactedTrail(payload, user);
    }
    async loadAllRedacted(user) {
        const results = await this.redactedTrailRepo.find();
        const data = results.map(rt => ({
            identifier: rt.id,
            organization_id: rt.orgId,
            trail: rt.trail,
            user_id: user.id
        }));
        return { data };
    }
    async publish(payload, user) {
        return await this.safePathRepo.saveSafePath(payload, user);
    }
    async loadSafePaths(orgId) {
        const data = await this.safePathRepo.find({ where: { orgId } });
        return { data };
    }
};
SafePlacesService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(safePath_repository_1.SafePathRepo)),
    __param(1, typeorm_1.InjectRepository(redactedTrail_repository_1.RedactedTrailRepo)),
    __metadata("design:paramtypes", [safePath_repository_1.SafePathRepo,
        redactedTrail_repository_1.RedactedTrailRepo])
], SafePlacesService);
exports.SafePlacesService = SafePlacesService;
//# sourceMappingURL=safeplaces.service.js.map