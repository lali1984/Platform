"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClientFactory = void 0;
const axios_1 = __importDefault(require("axios"));
const bff_config_1 = require("../config/bff.config");
class HttpClientFactory {
    static createClient(options) {
        const client = axios_1.default.create({
            baseURL: options.baseURL,
            timeout: options.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        // Request interceptor
        client.interceptors.request.use((config) => {
            console.log(`[HTTP Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
            return config;
        }, (error) => {
            console.error('[HTTP Request Error]', error);
            return Promise.reject(error);
        });
        // Response interceptor with retry logic
        client.interceptors.response.use((response) => response, async (error) => {
            const config = error.config;
            // If we haven't retried yet
            if (!config._retry && options.retries > 0) {
                config._retry = true;
                config._retryCount = config._retryCount || 0;
                if (config._retryCount < options.retries) {
                    config._retryCount++;
                    // Exponential backoff
                    const delay = Math.pow(2, config._retryCount) * 100;
                    console.log(`[HTTP Retry] Attempt ${config._retryCount} after ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return client(config);
                }
            }
            console.error('[HTTP Response Error]', {
                url: config.url,
                method: config.method,
                status: error.response?.status,
                message: error.message,
            });
            return Promise.reject(error);
        });
        return client;
    }
    static createAuthClient() {
        const serviceConfig = bff_config_1.bffConfig.services.auth;
        return this.createClient({
            baseURL: serviceConfig.url,
            timeout: serviceConfig.timeout,
            retries: serviceConfig.retries,
        });
    }
    static createUserClient() {
        const serviceConfig = bff_config_1.bffConfig.services.user;
        return this.createClient({
            baseURL: serviceConfig.url,
            timeout: serviceConfig.timeout,
            retries: serviceConfig.retries,
        });
    }
}
exports.HttpClientFactory = HttpClientFactory;
