"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserStatus = void 0;
const aggregate_root_base_1 = require("../base/aggregate-root.base");
const contracts_1 = require("@platform/contracts");
const uuid_1 = require("uuid");
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["INACTIVE"] = "INACTIVE";
    UserStatus["SUSPENDED"] = "SUSPENDED";
    UserStatus["DELETED"] = "DELETED";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
class User extends aggregate_root_base_1.AggregateRoot {
    constructor(props) {
        super(props);
    }
    getId() {
        return this.props.id;
    }
    get id() { return this.props.id; }
    get email() { return this.props.email; }
    get firstName() { return this.props.firstName; }
    get lastName() { return this.props.lastName; }
    get fullName() { return `${this.firstName} ${this.lastName}`.trim(); }
    get phone() { return this.props.phone; }
    get avatarUrl() { return this.props.avatarUrl; }
    get status() { return this.props.status; }
    get isVerified() { return this.props.isVerified; }
    get metadata() { return this.props.metadata; }
    get createdAt() { return this.props.createdAt; }
    get updatedAt() { return this.props.updatedAt; }
    get deletedAt() { return this.props.deletedAt; }
    isActive() {
        return this.status === UserStatus.ACTIVE;
    }
    verify() {
        this.props.isVerified = true;
        this.props.updatedAt = (0, contracts_1.toISO8601Date)(new Date());
    }
    deactivate() {
        this.props.status = UserStatus.INACTIVE;
        this.props.deletedAt = (0, contracts_1.toISO8601Date)(new Date());
        this.props.updatedAt = (0, contracts_1.toISO8601Date)(new Date());
    }
    delete() {
        this.props.status = UserStatus.DELETED;
        this.props.deletedAt = (0, contracts_1.toISO8601Date)(new Date());
        this.props.updatedAt = (0, contracts_1.toISO8601Date)(new Date());
    }
    updateProfile(data) {
        if (data.firstName)
            this.props.firstName = data.firstName;
        if (data.lastName)
            this.props.lastName = data.lastName;
        if (data.phone !== undefined) {
            if (data.phone === '') {
                this.props.phone = undefined;
            }
            else if (data.phone) {
                const phoneVo = (0, contracts_1.createPhoneNumber)(data.phone);
                if (!phoneVo) {
                    throw new Error(`Invalid phone number provided in updateProfile: ${data.phone}`);
                }
                this.props.phone = phoneVo;
            }
            else {
                this.props.phone = undefined;
            }
        }
        if (data.avatarUrl !== undefined)
            this.props.avatarUrl = data.avatarUrl;
        this.props.updatedAt = (0, contracts_1.toISO8601Date)(new Date());
    }
    static create(props) {
        const emailVo = (0, contracts_1.createEmail)(props.email);
        if (!emailVo) {
            throw new Error(`Invalid email provided: ${props.email}`);
        }
        const phoneVo = props.phone
            ? (() => {
                const vo = (0, contracts_1.createPhoneNumber)(props.phone);
                return vo !== null && vo !== void 0 ? vo : undefined;
            })()
            : undefined;
        if (props.phone && !phoneVo) {
            throw new Error(`Invalid phone number provided: ${props.phone}`);
        }
        const userId = props.id || props.authUserId || (0, uuid_1.v4)();
        const userIdVo = (0, contracts_1.unsafeCreateUserId)(userId);
        const user = new User({
            id: userIdVo,
            email: emailVo,
            firstName: props.firstName,
            lastName: props.lastName,
            phone: phoneVo,
            avatarUrl: props.avatarUrl,
            status: props.isActive === false ? UserStatus.INACTIVE : UserStatus.ACTIVE,
            isVerified: props.isVerified || false,
            metadata: Object.assign(Object.assign({}, (props.authUserId ? { authUserId: props.authUserId } : {})), { source: props.authUserId ? 'auth-service' : 'manual-creation' }),
            createdAt: (0, contracts_1.toISO8601Date)(new Date()),
            updatedAt: (0, contracts_1.toISO8601Date)(new Date()),
        });
        return user;
    }
    static createFromAuthEvent(props) {
        if (!props.authUserId) {
            throw new Error('authUserId is REQUIRED for creating user from auth event');
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(props.authUserId)) {
            throw new Error(`Invalid authUserId format (must be UUID): ${props.authUserId}`);
        }
        const emailVo = (0, contracts_1.createEmail)(props.email);
        if (!emailVo) {
            throw new Error(`Invalid email provided: ${props.email}`);
        }
        const phoneVo = props.phone
            ? (() => {
                const vo = (0, contracts_1.createPhoneNumber)(props.phone);
                return vo !== null && vo !== void 0 ? vo : undefined;
            })()
            : undefined;
        if (props.phone && !phoneVo) {
            throw new Error(`Invalid phone number provided: ${props.phone}`);
        }
        const userIdVo = (0, contracts_1.unsafeCreateUserId)(props.authUserId);
        const user = new User({
            id: userIdVo,
            email: emailVo,
            firstName: props.firstName,
            lastName: props.lastName,
            phone: phoneVo,
            avatarUrl: props.avatarUrl,
            status: UserStatus.ACTIVE,
            isVerified: props.isVerified || false,
            metadata: Object.assign({ authUserId: props.authUserId, source: 'auth-service-registration', originalEventTimestamp: new Date().toISOString() }, props.metadata),
            createdAt: (0, contracts_1.toISO8601Date)(new Date()),
            updatedAt: (0, contracts_1.toISO8601Date)(new Date()),
        });
        return user;
    }
    static createWithContext(context) {
        switch (context.source) {
            case 'auth-event':
                if (!context.data.authUserId) {
                    throw new Error('authUserId is required when source is "auth-event"');
                }
                return User.createFromAuthEvent({
                    authUserId: context.data.authUserId,
                    email: context.data.email,
                    firstName: context.data.firstName,
                    lastName: context.data.lastName,
                    phone: context.data.phone,
                    avatarUrl: context.data.avatarUrl,
                    isVerified: context.data.isVerified,
                    metadata: context.data.metadata,
                });
            case 'manual':
            case 'migration':
                return User.create({
                    email: context.data.email,
                    firstName: context.data.firstName,
                    lastName: context.data.lastName,
                    phone: context.data.phone,
                    avatarUrl: context.data.avatarUrl,
                    authUserId: context.data.authUserId,
                    isVerified: context.data.isVerified,
                });
            default:
                throw new Error(`Unknown context source: ${context.source}`);
        }
    }
    validateAuthIdConsistency() {
        var _a;
        const authUserId = (_a = this.metadata) === null || _a === void 0 ? void 0 : _a.authUserId;
        if (!authUserId) {
            return true;
        }
        return this.id === authUserId;
    }
    getAuthUserId() {
        var _a;
        return (_a = this.metadata) === null || _a === void 0 ? void 0 : _a.authUserId;
    }
    isFromAuthService() {
        var _a, _b;
        return ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.source) === 'auth-service' ||
            ((_b = this.metadata) === null || _b === void 0 ? void 0 : _b.source) === 'auth-service-registration';
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map