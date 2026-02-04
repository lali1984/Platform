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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_user_use_case_1 = require("../../application/use-cases/create-user.use-case");
const get_user_use_case_1 = require("../../application/use-cases/get-user.use-case");
const update_user_use_case_1 = require("../../application/use-cases/update-user.use-case");
const delete_user_use_case_1 = require("../../application/use-cases/delete-user.use-case");
const list_users_use_case_1 = require("../../application/use-cases/list-users.use-case");
const create_user_dto_1 = require("../../application/dto/create-user.dto");
const update_user_dto_1 = require("../../application/dto/update-user.dto");
const user_response_dto_1 = require("../dto/user-response.dto");
const user_mapper_1 = require("../../application/mappers/user.mapper");
let UserController = class UserController {
    constructor(createUserUseCase, getUserUseCase, updateUserUseCase, deleteUserUseCase, listUsersUseCase) {
        this.createUserUseCase = createUserUseCase;
        this.getUserUseCase = getUserUseCase;
        this.updateUserUseCase = updateUserUseCase;
        this.deleteUserUseCase = deleteUserUseCase;
        this.listUsersUseCase = listUsersUseCase;
    }
    async createUser(dto) {
        const user = await this.createUserUseCase.execute(dto);
        return user_mapper_1.UserMapper.toResponse(user);
    }
    async getUser(id) {
        const user = await this.getUserUseCase.execute(id);
        return user_mapper_1.UserMapper.toResponse(user);
    }
    async updateUser(id, dto) {
        const user = await this.updateUserUseCase.execute(id, dto);
        return user_mapper_1.UserMapper.toResponse(user);
    }
    async deleteUser(id) {
        await this.deleteUserUseCase.execute(id);
    }
    async listUsers(limit, offset, status, search) {
        const query = { limit, offset, status, search };
        const result = await this.listUsersUseCase.execute(query);
        return {
            users: result.users.map(user => user_mapper_1.UserMapper.toResponse(user)),
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'User ID' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'User deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List users with pagination' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Number of items per page' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, type: Number, description: 'Number of items to skip' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, type: String, description: 'Filter by status' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Search in email, first name, last name' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of users' }),
    __param(0, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(20), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('offset', new common_1.DefaultValuePipe(0), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "listUsers", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [create_user_use_case_1.CreateUserUseCase,
        get_user_use_case_1.GetUserUseCase,
        update_user_use_case_1.UpdateUserUseCase,
        delete_user_use_case_1.DeleteUserUseCase,
        list_users_use_case_1.ListUsersUseCase])
], UserController);
//# sourceMappingURL=user.controller.js.map