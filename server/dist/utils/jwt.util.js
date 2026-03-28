"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const env_config_1 = require("../config/env.config");
class JwtUtil {
    static generateToken(payload) {
        const tokenPayload = {
            ...payload,
            sub: payload.userId,
        };
        const options = {
            expiresIn: env_config_1.default.jwt.expiresIn,
        };
        return (0, jsonwebtoken_1.sign)(tokenPayload, env_config_1.default.jwt.secret, options);
    }
    static verifyToken(token) {
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, env_config_1.default.jwt.secret);
            return {
                sub: decoded.userId,
                userId: decoded.userId,
                openid: decoded.openid,
                role: decoded.role,
                status: decoded.status || 'active',
            };
        }
        catch (error) {
            throw new Error('Token无效或已过期');
        }
    }
    static extractUserId(token) {
        const payload = this.verifyToken(token);
        return payload.userId;
    }
    static extractOpenid(token) {
        const payload = this.verifyToken(token);
        return payload.openid;
    }
    static extractRole(token) {
        const payload = this.verifyToken(token);
        return payload.role;
    }
}
exports.JwtUtil = JwtUtil;
//# sourceMappingURL=jwt.util.js.map