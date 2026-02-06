import { TOTP } from 'otplib';
import * as QRCode from 'qrcode';
import { TwoFactorService as ITwoFactorService, TwoFactorSecret } from '../../domain/ports/two-factor-service.port';

export class TwoFactorService implements ITwoFactorService {
  private readonly issuer: string;
  private readonly totp: TOTP;
  
  constructor() {
    this.issuer = process.env.TWO_FACTOR_ISSUER || 'Platform Ecosystem';
    this.totp = new TOTP();
  }

  generateSecret(email: string): TwoFactorSecret {
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

  async generateSecretWithQR(email: string): Promise<TwoFactorSecret> {
    const secretData = this.generateSecret(email);
    const qrCodeUrl = await this.generateQRCode(secretData.otpauthUrl);
    
    return {
      ...secretData,
      qrCodeUrl,
    };
  }

  async verifyToken(secret: string, token: string): Promise<boolean> {
    try {
      // В otplib v13 verify принимает token и secret как отдельные аргументы
      const result = await this.totp.verify(token, { secret });
      return result.valid;
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    }
  }

  async generateQRCode(otpauthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpauthUrl);
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }
}