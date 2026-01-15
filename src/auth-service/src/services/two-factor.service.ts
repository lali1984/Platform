// src/services/two-factor.service.ts
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

export class TwoFactorService {
  generateSecret(email: string): string {
    return authenticator.generateSecret();
  }

  generateQRCode(secret: string, email: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, 'Platform Ecosystem', secret);
    return QRCode.toDataURL(otpauth);
  }

  verifyToken(secret: string, token: string): boolean {
    return authenticator.verify({ token, secret });
  }

  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}