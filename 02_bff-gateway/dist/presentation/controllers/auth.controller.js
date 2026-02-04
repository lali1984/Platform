"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const api_response_vo_1 = require("../../domain/value-objects/api-response.vo");
const validation_middleware_1 = require("../middleware/validation.middleware");
const chemas_1 = require("../../shared/validation/chemas");
class AuthController {
    constructor(authUserUseCase) {
        this.authUserUseCase = authUserUseCase;
        this.validateRegister = (0, validation_middleware_1.validateBody)(chemas_1.RegisterSchema);
        this.validateLogin = (0, validation_middleware_1.validateBody)(chemas_1.LoginSchema);
        this.validateToken = async (req, res) => {
            try {
                const { token } = req.body;
                if (!token) {
                    res.status(400).json(api_response_vo_1.ApiResponse.error('Token is required').toJSON());
                    return;
                }
                // Проксируем запрос к auth-service
                const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
                const response = await fetch(`${authServiceUrl}/auth/validate-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });
                const data = await response.json();
                res.status(response.status).json(data);
            }
            catch (error) {
                console.error('AuthController.validateToken error:', error);
                res.status(500).json(api_response_vo_1.ApiResponse.error('Internal server error').toJSON());
            }
        };
        this.register = async (req, res) => {
            try {
                const { email, password, username, firstName, lastName } = req.body;
                const result = await this.authUserUseCase.register({
                    email,
                    password,
                    username,
                    firstName,
                    lastName
                });
                res.status(result.success ? 201 : 400).json(result.toJSON());
            }
            catch (error) {
                console.error('AuthController.register error:', error);
                res.status(500).json(api_response_vo_1.ApiResponse.error('Internal server error').toJSON());
            }
        };
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                const result = await this.authUserUseCase.login({ email, password });
                res.status(result.success ? 200 : 401).json(result.toJSON());
            }
            catch (error) {
                console.error('AuthController.login error:', error);
                res.status(500).json(api_response_vo_1.ApiResponse.error('Internal server error').toJSON());
            }
        };
        this.logout = async (req, res) => {
            try {
                const token = req.headers.authorization?.split(' ')[1];
                if (!token) {
                    res.status(400).json(api_response_vo_1.ApiResponse.error('Token is required').toJSON());
                    return;
                }
                const result = await this.authUserUseCase.logout(token);
                res.status(result.success ? 200 : 400).json(result.toJSON());
            }
            catch (error) {
                console.error('AuthController.logout error:', error);
                res.status(500).json(api_response_vo_1.ApiResponse.error('Internal server error').toJSON());
            }
        };
        this.refreshToken = async (req, res) => {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    res.status(400).json(api_response_vo_1.ApiResponse.error('Refresh token is required').toJSON());
                    return;
                }
                const result = await this.authUserUseCase.refreshToken(refreshToken);
                res.status(result.success ? 200 : 401).json(result.toJSON());
            }
            catch (error) {
                console.error('AuthController.refreshToken error:', error);
                res.status(500).json(api_response_vo_1.ApiResponse.error('Internal server error').toJSON());
            }
        };
    }
}
exports.AuthController = AuthController;
