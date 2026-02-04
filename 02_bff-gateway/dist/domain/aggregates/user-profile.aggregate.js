"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileAggregate = void 0;
class UserProfileAggregate {
    constructor(authData, profileData, metadata) {
        this.authData = authData;
        this.profileData = profileData;
        this.metadata = metadata;
    }
    get fullName() {
        return `${this.profileData.profile.firstName} ${this.profileData.profile.lastName}`.trim();
    }
    get displayName() {
        return this.profileData.profile.username || this.fullName || this.authData.email;
    }
    get hasAvatar() {
        return !!this.profileData.profile.avatarUrl;
    }
    can(permission) {
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
    static create(authData, profileData, sessionId) {
        return new UserProfileAggregate(authData, profileData, {
            lastLogin: new Date(),
            sessionId,
            permissions: authData.permissions,
        });
    }
}
exports.UserProfileAggregate = UserProfileAggregate;
