export interface TokenPayload {
    sub: string;
    userId: string;
    openid: string;
    role: 'user' | 'admin';
    status: 'active' | 'disabled' | 'deleted' | 'pending';
}
export declare class JwtUtil {
    static generateToken(payload: Omit<TokenPayload, 'sub'>): string;
    static verifyToken(token: string): TokenPayload;
    static extractUserId(token: string): string;
    static extractOpenid(token: string): string;
    static extractRole(token: string): 'user' | 'admin';
}
