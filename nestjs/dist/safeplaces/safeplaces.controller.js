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
const safeplaces_service_1 = require("./safeplaces.service");
const get_user_1 = require("../auth/decorators/get-user");
const saveRedacted_dto_1 = require("./types/payload/saveRedacted.dto");
const publish_dto_1 = require("./types/payload/publish.dto");
const passport_1 = require("@nestjs/passport");
let SafePlacesController = class SafePlacesController {
    constructor(safePlacesService) {
        this.safePlacesService = safePlacesService;
    }
    saveRedactedTrail(payload, user) {
        return this.safePlacesService.saveRedactedTrail(payload, user);
    }
    loadAllRedacted(user) {
        return this.safePlacesService.loadAllRedacted(user);
    }
    publish(payload, user) {
        return this.safePlacesService.publish(payload, user);
    }
    loadSafePathJson(orgId) {
        return this.safePlacesService.loadSafePaths(orgId);
    }
};
__decorate([
    common_1.Post('/redacted_trail'),
    common_1.UseGuards(passport_1.AuthGuard()),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, common_1.Body()),
    __param(1, get_user_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [saveRedacted_dto_1.SaveRedactedDto, Object]),
    __metadata("design:returntype", Promise)
], SafePlacesController.prototype, "saveRedactedTrail", null);
__decorate([
    common_1.Get('/redacted_trails'),
    common_1.UseGuards(passport_1.AuthGuard()),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, get_user_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SafePlacesController.prototype, "loadAllRedacted", null);
__decorate([
    common_1.Post('/safe_paths'),
    common_1.UseGuards(passport_1.AuthGuard()),
    openapi.ApiResponse({ status: 201, type: Object }),
    __param(0, common_1.Body()), __param(1, get_user_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [publish_dto_1.PublishDto, Object]),
    __metadata("design:returntype", Promise)
], SafePlacesController.prototype, "publish", null);
__decorate([
    common_1.Get('/safe_path/:orgId'),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, common_1.Param('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SafePlacesController.prototype, "loadSafePathJson", null);
SafePlacesController = __decorate([
    common_1.Controller(),
    __metadata("design:paramtypes", [safeplaces_service_1.SafePlacesService])
], SafePlacesController);
exports.SafePlacesController = SafePlacesController;
//# sourceMappingURL=safeplaces.controller.js.map