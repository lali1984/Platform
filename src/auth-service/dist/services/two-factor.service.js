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
// src/services/two-factor.service.ts
const otplib_1 = require("otplib");
const QRCode = __importStar(require("qrcode"));
class TwoFactorService {
    generateSecret(email) {
        return otplib_1.authenticator.generateSecret();
    }
    generateQRCode(secret, email) {
        const otpauth = otplib_1.authenticator.keyuri(email, 'Platform Ecosystem', secret);
        return QRCode.toDataURL(otpauth);
    }
    verifyToken(secret, token) {
        return otplib_1.authenticator.verify({ token, secret });
    }
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
        }
        return codes;
    }
}
exports.TwoFactorService = TwoFactorService;
//# sourceMappingURL=two-factor.service.js.map