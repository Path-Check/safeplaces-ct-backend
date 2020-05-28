"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid = require("uuid/v4");
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const safepath_entity_1 = require("../entities/safepath.entity");
const config_1 = require("../../../config");
let SafePathRepo = class SafePathRepo extends typeorm_1.Repository {
    async saveSafePath(payload, user) {
        const { authority_name, publish_date, info_website, concern_points } = payload;
        const sp = new safepath_entity_1.SafePath();
        sp.id = uuid();
        sp.orgId = config_1.orgId;
        sp.infoWebsite = info_website;
        sp.authorityName = authority_name;
        sp.concernPoints = concern_points;
        sp.publishDate = publish_date;
        sp.userId = user.id;
        sp.createdAt = new Date();
        try {
            await sp.save();
            return {
                datetime_created: sp.createdAt,
                organization_id: sp.orgId,
                safe_path: {
                    authority_name: sp.authorityName,
                    concern_points: sp.concernPoints,
                    info_website: sp.infoWebsite,
                    publish_date: sp.publishDate
                },
                user_id: user.id
            };
        }
        catch (err) {
            throw new common_1.InternalServerErrorException();
        }
    }
};
SafePathRepo = __decorate([
    typeorm_1.EntityRepository(safepath_entity_1.SafePath)
], SafePathRepo);
exports.SafePathRepo = SafePathRepo;
//# sourceMappingURL=safePath.repository.js.map