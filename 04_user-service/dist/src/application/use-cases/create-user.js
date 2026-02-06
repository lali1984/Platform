"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CreateUserUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const user_profile_1 = require("../../domain/entities/user-profile");
const user_1 = require("../mappers/user");
const outbox_publisher_1 = require("../../infrastructure/messaging/outbox-publisher");
const contracts_1 = require("@platform/contracts");
let CreateUserUseCase = CreateUserUseCase_1 = class CreateUserUseCase {
    constructor(userRepository, outboxEventPublisher) {
        this.userRepository = userRepository;
        this.outboxEventPublisher = outboxEventPublisher;
        this.logger = new common_1.Logger(CreateUserUseCase_1.name);
    }
    async execute(dto) {
        this.validateCreateUserDto(dto);
        const transactionResult = await (0, typeorm_1.getManager)().transaction(async (transactionalEntityManager) => {
            try {
                const context = this.determineCreationContext(dto);
                this.logger.log(`Creating user with context: ${context}`);
                let user;
                if (context === 'auth-event') {
                    user = user_profile_1.User.createFromAuthEvent({
                        authUserId: dto.authUserId,
                        email: dto.email,
                        firstName: dto.firstName || '',
                        lastName: dto.lastName || '',
                        phone: dto.phone,
                        avatarUrl: dto.avatarUrl,
                        isVerified: dto.isVerified || false,
                        metadata: Object.assign(Object.assign({}, dto.metadata), { creationContext: 'auth-event', processedAt: new Date().toISOString() }),
                    });
                }
                else {
                    user = user_profile_1.User.create({
                        email: dto.email,
                        firstName: dto.firstName || '',
                        lastName: dto.lastName || '',
                        phone: dto.phone,
                        avatarUrl: dto.avatarUrl,
                        authUserId: dto.authUserId,
                        isActive: dto.status !== 'INACTIVE',
                        isVerified: dto.isVerified || false,
                    });
                }
                this.validateCreatedUser(user, dto);
                const existingUser = await this.checkExistingUser(user, dto);
                if (existingUser) {
                    this.logger.warn(`User already exists: ${user.id}. Returning existing user.`);
                    return existingUser;
                }
                const userEntity = user_1.UserMapper.toEntity(user);
                const savedEntity = await transactionalEntityManager.save(userEntity);
                await this.publishUserCreatedEvent(user, dto, transactionalEntityManager);
                this.logger.log(`✅ Created user profile: ${user.id} (auth ID: ${dto.authUserId || 'N/A'})`);
                return user;
            }
            catch (error) {
                await this.handleCreationError(error, dto);
                throw error;
            }
        });
        if (!transactionResult) {
            throw new common_1.InternalServerErrorException('Transaction failed to return a user');
        }
        return transactionResult;
    }
    validateCreateUserDto(dto) {
        const errors = [];
        if (!dto.email) {
            errors.push('Email is required');
        }
        else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(dto.email)) {
                errors.push(`Invalid email format: ${dto.email}`);
            }
        }
        if (dto.authUserId) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(dto.authUserId)) {
                errors.push(`Invalid authUserId format (must be UUID): ${dto.authUserId}`);
            }
        }
        if (dto.metadata && typeof dto.metadata !== 'object') {
            errors.push('metadata must be an object if provided');
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException(`Invalid CreateUserDto: ${errors.join(', ')}`);
        }
    }
    determineCreationContext(dto) {
        var _a, _b, _c, _d;
        if (dto.authUserId) {
            const source = (_a = dto.metadata) === null || _a === void 0 ? void 0 : _a.source;
            if (source === 'auth-service' ||
                source === 'auth-service-registration' ||
                ((_b = dto.metadata) === null || _b === void 0 ? void 0 : _b.originalEventId)) {
                return 'auth-event';
            }
        }
        if (((_c = dto.metadata) === null || _c === void 0 ? void 0 : _c.migrationId) || ((_d = dto.metadata) === null || _d === void 0 ? void 0 : _d.isMigration)) {
            return 'migration';
        }
        return 'manual';
    }
    validateCreatedUser(user, dto) {
        if (!user.id) {
            throw new common_1.InternalServerErrorException('Created user has no ID');
        }
        if (dto.authUserId && this.determineCreationContext(dto) === 'auth-event') {
            if (user.id !== dto.authUserId) {
                this.logger.error(`🚨 CRITICAL: User ID mismatch!`, {
                    expectedId: dto.authUserId,
                    actualId: user.id,
                    email: dto.email,
                    context: 'auth-event',
                });
                throw new common_1.InternalServerErrorException(`User ID mismatch: expected ${dto.authUserId}, got ${user.id}`);
            }
            this.logger.debug(`✅ User ID validation passed: ${user.id} matches authUserId`);
        }
        if (!user.validateAuthIdConsistency()) {
            this.logger.warn(`⚠️ Auth ID inconsistency detected for user: ${user.id}`);
        }
    }
    async checkExistingUser(user, dto) {
        try {
            const existingById = await this.userRepository.findById(user.id);
            if (existingById) {
                this.logger.log(`Found existing user by ID: ${user.id}`);
                return existingById;
            }
            if (this.determineCreationContext(dto) !== 'auth-event') {
                const existingByEmail = await this.userRepository.findByEmail(user.email);
                if (existingByEmail) {
                    this.logger.log(`Found existing user by email: ${user.email}`);
                    return existingByEmail;
                }
            }
            if (dto.authUserId) {
                const existingByAuthId = await this.userRepository.findByEmail(dto.email);
                if (existingByAuthId && existingByAuthId.getAuthUserId() === dto.authUserId) {
                    this.logger.log(`Found existing user by authUserId: ${dto.authUserId}`);
                    return existingByAuthId;
                }
            }
            return null;
        }
        catch (error) {
            this.logger.warn(`Error checking for existing user: ${error}`);
            return null;
        }
    }
    async publishUserCreatedEvent(user, dto, transactionalEntityManager) {
        var _a, _b, _c, _d, _e;
        try {
            const baseEvent = (0, contracts_1.createUserCreatedEvent)(user.id, user.email, user.firstName, user.lastName, {
                phone: (_a = user.phone) !== null && _a !== void 0 ? _a : undefined,
                avatarUrl: (_b = user.avatarUrl) !== null && _b !== void 0 ? _b : undefined,
                status: user.status,
                isVerified: user.isVerified,
                metadata: Object.assign({ source: this.determineCreationContext(dto), authUserId: dto.authUserId || undefined, correlationId: (_c = dto.metadata) === null || _c === void 0 ? void 0 : _c.correlationId }, dto.metadata),
            });
            const platformEvent = {
                eventId: baseEvent.eventId,
                type: baseEvent.eventType,
                version: baseEvent.eventVersion,
                timestamp: new Date(baseEvent.timestamp),
                data: baseEvent.payload,
                correlationId: (_d = baseEvent.metadata) === null || _d === void 0 ? void 0 : _d.correlationId,
                source: ((_e = baseEvent.metadata) === null || _e === void 0 ? void 0 : _e.sourceService) || 'user-service',
                metadata: baseEvent.metadata,
                toJSON() {
                    return JSON.stringify({
                        eventId: this.eventId,
                        type: this.type,
                        version: this.version,
                        timestamp: this.timestamp.toISOString(),
                        data: this.data,
                        correlationId: this.correlationId,
                        source: this.source,
                        metadata: this.metadata,
                    });
                },
                getPartitionKey() {
                    return baseEvent.aggregateId || this.eventId;
                },
            };
            await this.outboxEventPublisher.publishInTransaction(platformEvent, transactionalEntityManager);
            this.logger.debug(`Published UserCreated event: ${platformEvent.eventId}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish UserCreated event: ${error}`);
        }
    }
    async handleCreationError(error, dto) {
        this.logger.error(`❌ Failed to create user: ${error instanceof Error ? error.message : 'Unknown'}`, error instanceof Error ? error.stack : undefined);
        if (error instanceof Error && 'code' in error) {
            const errorCode = error.code;
            if (errorCode === '23505') {
                let errorDetail = '';
                if ('detail' in error && typeof error.detail === 'string') {
                    errorDetail = error.detail;
                }
                if (errorDetail.includes('user_id')) {
                    throw new common_1.ConflictException(`User profile already exists for auth user: ${dto.authUserId}`);
                }
                else if (errorDetail.includes('email')) {
                    throw new common_1.ConflictException(`User with email ${dto.email} already exists`);
                }
                else {
                    throw new common_1.ConflictException('User already exists');
                }
            }
            if (errorCode === '23514') {
                throw new common_1.BadRequestException(`Invalid data: ${error.message}`);
            }
        }
        throw new common_1.InternalServerErrorException('Failed to create user');
    }
    async createFromAuthEvent(dto) {
        const authEventDto = Object.assign(Object.assign({}, dto), { metadata: Object.assign(Object.assign({}, dto.metadata), { source: 'auth-service-registration', isAuthEvent: true }) });
        return this.execute(authEventDto);
    }
};
exports.CreateUserUseCase = CreateUserUseCase;
exports.CreateUserUseCase = CreateUserUseCase = CreateUserUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)('UserRepository')),
    __metadata("design:paramtypes", [Object, outbox_publisher_1.OutboxEventPublisher])
], CreateUserUseCase);
//# sourceMappingURL=create-user.js.map