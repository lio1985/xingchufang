"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidUUID = isValidUUID;
exports.parseOptionalUUID = parseOptionalUUID;
exports.parseRequiredUUID = parseRequiredUUID;
const common_1 = require("@nestjs/common");
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUUID(str) {
    if (!str || typeof str !== 'string') {
        return false;
    }
    return UUID_REGEX.test(str.trim());
}
function parseOptionalUUID(value, paramName = 'userId') {
    if (value === undefined || value === null || value.trim() === '') {
        return undefined;
    }
    const trimmed = value.trim();
    if (isValidUUID(trimmed)) {
        return trimmed;
    }
    throw new common_1.BadRequestException(`参数 ${paramName} 必须是有效的 UUID 格式， received: "${trimmed}"`);
}
function parseRequiredUUID(value, paramName = 'userId') {
    if (value === undefined || value === null || value.trim() === '') {
        throw new common_1.BadRequestException(`参数 ${paramName} 不能为空`);
    }
    const trimmed = value.trim();
    if (!isValidUUID(trimmed)) {
        throw new common_1.BadRequestException(`参数 ${paramName} 必须是有效的 UUID 格式， received: "${trimmed}"`);
    }
    return trimmed;
}
//# sourceMappingURL=uuid.util.js.map