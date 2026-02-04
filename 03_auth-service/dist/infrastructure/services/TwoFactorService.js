"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorService = void 0;
const otplib_1 = require("otplib");
const QRCode = __importStar(require("qrcode"));
class TwoFactorService {
    constructor() {
        this.issuer = process.env.TWO_FACTOR_ISSUER || 'Platform Ecosystem';
        this.totp = new otplib_1.TOTP();
    }
    generateSecret(email) {
        const secret = this.totp.generateSecret();
        const otpauthUrl = this.totp.toURI({
            secret,
            label: email,
            issuer: this.issuer,
        });
        return {
            secret,
            qrCodeUrl: '', // Будет сгенерирован позже
            otpauthUrl,
        };
    }
    async generateSecretWithQR(email) {
        const secretData = this.generateSecret(email);
        const qrCodeUrl = await this.generateQRCode(secretData.otpauthUrl);
        return {
            ...secretData,
            qrCodeUrl,
        };
    }
    async verifyToken(secret, token) {
        try {
            // В otplib v13 verify принимает token и secret как отдельные аргументы
            const result = await this.totp.verify(token, { secret });
            return result.valid;
        }
        catch (error) {
            console.error('2FA verification error:', error);
            return false;
        }
    }
    async generateQRCode(otpauthUrl) {
        try {
            return await QRCode.toDataURL(otpauthUrl);
        }
        catch (error) {
            console.error('QR code generation error:', error);
            throw new Error('Failed to generate QR code');
        }
    }
}
exports.TwoFactorService = TwoFactorService;
//# sourceMappingURL=TwoFactorService.js.map