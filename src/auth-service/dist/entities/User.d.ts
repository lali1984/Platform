export declare class UserEntity {
    id: string;
    email: string;
    passwordHash: string;
    isEmailVerified: boolean;
    twoFactorSecret?: string;
    isTwoFactorEnabled: boolean;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    validatePassword(password: string): Promise<boolean>;
    hashPasswordOnInsert(): Promise<void>;
    hashPasswordOnUpdate(): Promise<void>;
    setPassword(password: string): Promise<void>;
}
//# sourceMappingURL=User.d.ts.map