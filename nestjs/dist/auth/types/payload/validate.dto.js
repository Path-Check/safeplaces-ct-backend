"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi = require("@nestjs/swagger");
class ValidateDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { username: { required: true, type: () => String }, password: { required: true, type: () => String } };
    }
}
exports.ValidateDto = ValidateDto;
//# sourceMappingURL=validate.dto.js.map