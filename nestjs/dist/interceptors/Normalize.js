"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
let NormalizeInterceptor = class NormalizeInterceptor {
    intercept(context, next) {
        const { headers, body } = context.switchToHttp().getRequest();
        if (headers['content-type'] === 'application/x-www-form-urlencoded') {
            headers['content-type'] = 'application/json';
            context.switchToHttp().getRequest().body = JSON.parse(Object.keys(body)[0]);
        }
        return next.handle();
    }
};
NormalizeInterceptor = __decorate([
    common_1.Injectable()
], NormalizeInterceptor);
exports.NormalizeInterceptor = NormalizeInterceptor;
//# sourceMappingURL=Normalize.js.map