import { UserAuthData } from '@platform/contracts';
import { CompleteUserProfile } from '../ports/user-client';

export class UserProfileAggregate {
  constructor(
    public readonly authData: UserAuthData,
    public readonly profileData: CompleteUserProfile,
    public readonly metadata: {
      lastLogin: Date;
      sessionId: string;
      permissions: string[];
    }
  ) {}

  get fullName(): string {
    return `${this.profileData.profile.firstName} ${this.profileData.profile.lastName}`.trim();
  }

  get displayName(): string {
    return this.profileData.profile.username || this.fullName || this.authData.email;
  }

  get hasAvatar(): boolean {
    return !!this.profileData.profile.avatarUrl;
  }

  can(permission: string): boolean {
    return this.metadata.permissions.includes(permission);
  }

  toJSON() {
    return {
      id: this.authData.id,
      email: this.authData.email,
      role: this.authData.role,
      username: this.profileData.profile.username,
      firstName: this.profileData.profile.firstName,
      lastName: this.profileData.profile.lastName,
      avatarUrl: this.profileData.profile.avatarUrl,
      bio: this.profileData.profile.bio,
      preferences: this.profileData.preferences,
      statistics: this.profileData.statistics,
      permissions: this.metadata.permissions,
      lastLogin: this.metadata.lastLogin,
      displayName: this.displayName,
      fullName: this.fullName,
      hasAvatar: this.hasAvatar,
    };
  }

  static create(
    authData: UserAuthData,
    profileData: CompleteUserProfile,
    sessionId: string
  ): UserProfileAggregate {
    return new UserProfileAggregate(authData, profileData, {
      lastLogin: new Date(),
      sessionId,
      permissions: authData.permissions,
    });
  }
}