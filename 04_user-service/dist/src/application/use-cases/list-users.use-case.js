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
exports.ListUsersUseCase = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../domain/entities/user.entity");
let ListUsersUseCase = class ListUsersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(query = {}) {
        const { limit = 20, offset = 0, status, search } = query;
        const page = Math.floor(offset / limit) + 1;
        const allUsers = await this.userRepository.findAll();
        let filteredUsers = allUsers;
        if (status) {
            if (Object.values(user_entity_1.UserStatus).includes(status)) {
                const userStatus = status;
                filteredUsers = filteredUsers.filter(user => user.status === userStatus);
            }
        }
        if (search) {
            const searchLower = search.toLowerCase();
            filteredUsers = filteredUsers.filter(user => {
                const emailString = user.email.toLowerCase();
                const firstName = user.firstName.toLowerCase();
                const lastName = user.lastName.toLowerCase();
                return emailString.includes(searchLower) ||
                    firstName.includes(searchLower) ||
                    lastName.includes(searchLower);
            });
        }
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);
        return {
            users: paginatedUsers,
            total: filteredUsers.length,
            page,
            limit,
        };
    }
};
exports.ListUsersUseCase = ListUsersUseCase;
exports.ListUsersUseCase = ListUsersUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('UserRepository')),
    __metadata("design:paramtypes", [Object])
], ListUsersUseCase);
//# sourceMappingURL=list-users.use-case.js.map