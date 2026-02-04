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
var HandleUserRegisteredEventUseCase_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleUserRegisteredEventUseCase = void 0;
const common_1 = require("@nestjs/common");
const create_user_use_case_1 = require("./create-user.use-case");
const user_entity_1 = require("../../domain/entities/user.entity");
let HandleUserRegisteredEventUseCase = HandleUserRegisteredEventUseCase_1 = class HandleUserRegisteredEventUseCase {
    constructor(createUserUseCase) {
        this.createUserUseCase = createUserUseCase;
        this.logger = new common_1.Logger(HandleUserRegisteredEventUseCase_1.name);
        this.maxRetries = 3;
        this.retryDelays = [1000, 5000, 15000];
    }
    async execute(event) {
        var _a, _b;
        const eventId = event.eventId || 'unknown';
        this.logger.log(`📨 Processing UserRegistered event: ${eventId} for auth user: ${event.data.userId}`);
        try {
            this.validateEvent(event);
            const name = event.data.name || '';
            const nameParts = name.trim().split(/\s+/);
            let firstName = '';
            let lastName = '';
            if (nameParts.length === 1) {
                firstName = nameParts[0];
            }
            else if (nameParts.length >= 2) {
                firstName = nameParts[0];
                lastName = nameParts.slice(1).join(' ');
            }
            if (!firstName && event.data.email) {
                firstName = event.data.email.split('@')[0];
            }
            const createUserDto = {
                authUserId: event.data.userId,
                email: event.data.email,
                firstName: firstName || '',
                lastName: lastName || '',
                phone: ((_a = event.metadata) === null || _a === void 0 ? void 0 : _a.phone) || undefined,
                avatarUrl: ((_b = event.metadata) === null || _b === void 0 ? void 0 : _b.avatarUrl) || undefined,
                isVerified: false,
                status: user_entity_1.UserStatus.ACTIVE,
                metadata: Object.assign({ source: 'auth-service-registration', originalEventId: event.eventId, correlationId: event.correlationId, registeredAt: event.data.registeredAt || new Date().toISOString(), eventSource: event.source || 'unknown', eventVersion: event.version || '1.0.0', processingTimestamp: new Date().toISOString() }, event.metadata)
            };
            await this.executeWithRetry(createUserDto, eventId);
            this.logger.log(`✅ Successfully created profile for auth user: ${event.data.userId}`);
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                this.logger.warn(`⚠️ User profile already exists for auth user: ${event.data.userId}. Skipping.`);
                return;
            }
            this.logger.error(`❌ Failed to create user profile for ${event.data.userId}:`, {
                error: error instanceof Error ? error.message : 'Unknown error',
                eventId: event.eventId,
                authUserId: event.data.userId,
            });
            throw error;
        }
    }
    validateEvent(event) {
        var _a, _b, _c;
        const errors = [];
        if (!event.eventId) {
            errors.push('Missing eventId');
        }
        if (!((_a = event.data) === null || _a === void 0 ? void 0 : _a.userId)) {
            errors.push('Missing userId in event data');
        }
        else {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(event.data.userId)) {
                errors.push(`Invalid userId format (must be UUID): ${event.data.userId}`);
            }
        }
        if (!((_b = event.data) === null || _b === void 0 ? void 0 : _b.email)) {
            errors.push('Missing email in event data');
        }
        else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(event.data.email)) {
                errors.push(`Invalid email format: ${event.data.email}`);
            }
        }
        if (!((_c = event.data) === null || _c === void 0 ? void 0 : _c.registeredAt)) {
            errors.push('Missing registeredAt in event data');
        }
        else {
            const registeredDate = new Date(event.data.registeredAt);
            if (isNaN(registeredDate.getTime())) {
                errors.push(`Invalid registeredAt date: ${event.data.registeredAt}`);
            }
        }
        if (errors.length > 0) {
            throw new Error(`Invalid UserRegisteredEvent: ${errors.join(', ')}`);
        }
    }
    async executeWithRetry(createUserDto, eventId) {
        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const user = await this.createUserUseCase.execute(createUserDto);
                if (user.id !== createUserDto.authUserId) {
                    this.logger.error(`🚨 ID MISMATCH! Auth: ${createUserDto.authUserId}, User Service: ${user.id}`);
                }
                this.logger.debug(`Created profile. Auth User ID: ${createUserDto.authUserId}, User Service ID: ${user.id}`);
                return;
            }
            catch (error) {
                const isLastAttempt = attempt === this.maxRetries - 1;
                if (isLastAttempt) {
                    this.logger.error(`❌ All retry attempts failed for event ${eventId}:`, {
                        attempt: attempt + 1,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        authUserId: createUserDto.authUserId,
                    });
                    throw error;
                }
                const delay = this.retryDelays[attempt];
                this.logger.warn(`⚠️ Retry attempt ${attempt + 1}/${this.maxRetries} for event ${eventId} in ${delay}ms`, {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    authUserId: createUserDto.authUserId,
                });
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    async isDuplicateEvent(eventId) {
        return false;
    }
};
exports.HandleUserRegisteredEventUseCase = HandleUserRegisteredEventUseCase;
exports.HandleUserRegisteredEventUseCase = HandleUserRegisteredEventUseCase = HandleUserRegisteredEventUseCase_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [create_user_use_case_1.CreateUserUseCase])
], HandleUserRegisteredEventUseCase);
//# sourceMappingURL=handle-user-registered-event.use-case.js.map