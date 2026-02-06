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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserUseCase = void 0;
const common_1 = require("@nestjs/common");
const event_publisher_port_1 = require("../../domain/ports/event-publisher.port");
let UpdateUserUseCase = class UpdateUserUseCase {
    constructor(userRepository, eventPublisher) {
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(userId, dto) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }
        const updatedFields = [];
        const updateData = {};
        if (dto.firstName !== undefined) {
            updateData.firstName = dto.firstName;
            updatedFields.push('firstName');
        }
        if (dto.lastName !== undefined) {
            updateData.lastName = dto.lastName;
            updatedFields.push('lastName');
        }
        if (dto.phone !== undefined) {
            updateData.phone = dto.phone;
            updatedFields.push('phone');
        }
        if (dto.avatarUrl !== undefined) {
            updateData.avatarUrl = dto.avatarUrl;
            updatedFields.push('avatarUrl');
        }
        if (dto.metadata !== undefined) {
            updateData.metadata = dto.metadata;
            updatedFields.push('metadata');
        }
        user.updateProfile(updateData);
        await this.userRepository.save(user);
        if (updatedFields.length > 0) {
            const event = event_publisher_port_1.EventUtils.createUserEvent('user.updated', {
                userId: user.id,
                updatedFields,
                oldValues: {},
                newValues: updateData,
            }, {
                correlationId: userId,
                metadata: {
                    service: 'user-service',
                    action: 'update',
                },
            });
            await this.eventPublisher.publish(event);
        }
        return user;
    }
};
exports.UpdateUserUseCase = UpdateUserUseCase;
exports.UpdateUserUseCase = UpdateUserUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('UserRepository')),
    __param(1, (0, common_1.Inject)('EventPublisher')),
    __metadata("design:paramtypes", [Object, Object])
], UpdateUserUseCase);
//# sourceMappingURL=update-user.js.map