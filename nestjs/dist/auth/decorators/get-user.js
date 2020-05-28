"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
exports.GetUser = common_1.createParamDecorator((data, req) => req.user);
//# sourceMappingURL=get-user.js.map