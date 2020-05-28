"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const redactedTrail_entity_1 = require("../entities/redactedTrail.entity");
const config_1 = require("../../../config");
let RedactedTrailRepo = class RedactedTrailRepo extends typeorm_1.Repository {
    async saveRedactedTrail(payload, user) {
        const { identifier, trail } = payload;
        const rt = new redactedTrail_entity_1.RedactedTrail();
        rt.id = identifier;
        rt.orgId = config_1.orgId;
        rt.trail = trail;
        rt.userId = user.id;
        try {
            await rt.save();
            return {
                data: {
                    identifier: rt.id,
                    organization_id: rt.orgId,
                    trail: rt.trail,
                    user_id: rt.userId
                },
                success: true
            };
        }
        catch (err) {
            throw new common_1.InternalServerErrorException();
        }
    }
};
RedactedTrailRepo = __decorate([
    typeorm_1.EntityRepository(redactedTrail_entity_1.RedactedTrail)
], RedactedTrailRepo);
exports.RedactedTrailRepo = RedactedTrailRepo;
//# sourceMappingURL=redactedTrail.repository.js.map