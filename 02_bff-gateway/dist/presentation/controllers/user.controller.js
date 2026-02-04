"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const api_response_vo_1 = require("../../domain/value-objects/api-response.vo");
class UserController {
    constructor(getUserProfileUseCase) {
        this.getUserProfileUseCase = getUserProfileUseCase;
        this.getProfile = async (req, res) => {
            try {
                const token = req.token;
                const userId = req.params.userId;
                const result = await this.getUserProfileUseCase.execute(token, userId);
                if (!result.success) {
                    res.status(result.error?.includes('Invalid') ? 401 : 404).json(result.toJSON());
                    return;
                }
                res.status(200).json(result.toJSON());
            }
            catch (error) {
                console.error('UserController.getProfile error:', error);
                res.status(500).json(api_response_vo_1.ApiResponse.error('Internal server error').toJSON());
            }
        };
        this.getMyProfile = async (req, res) => {
            try {
                const token = req.token;
                const result = await this.getUserProfileUseCase.execute(token);
                if (!result.success) {
                    res.status(result.error?.includes('Invalid') ? 401 : 404).json(result.toJSON());
                    return;
                }
                res.status(200).json(result.toJSON());
            }
            catch (error) {
                console.error('UserController.getMyProfile error:', error);
                res.status(500).json(api_response_vo_1.ApiResponse.error('Internal server error').toJSON());
            }
        };
        this.searchUsers = async (req, res) => {
            try {
                const { query, limit } = req.query;
                // This would use a SearchUsersUseCase
                // For now, return mock response
                res.status(200).json(api_response_vo_1.ApiResponse.success([]).toJSON());
            }
            catch (error) {
                console.error('UserController.searchUsers error:', error);
                res.status(500).json(api_response_vo_1.ApiResponse.error('Internal server error').toJSON());
            }
        };
    }
}
exports.UserController = UserController;
