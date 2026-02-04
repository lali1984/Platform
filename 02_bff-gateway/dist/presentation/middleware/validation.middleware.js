"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
const api_response_vo_1 = require("../../domain/value-objects/api-response.vo");
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Валидируем body, query и params
            const validatedData = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Заменяем оригинальные данные валидированными
            req.body = validatedData.body || req.body;
            req.query = validatedData.query || req.query;
            req.params = validatedData.params || req.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message,
                    code: issue.code,
                }));
                res.status(400).json(api_response_vo_1.ApiResponse.error('Validation failed', errors).toJSON());
            }
            else {
                res.status(500).json(api_response_vo_1.ApiResponse.error('Internal server error').toJSON());
            }
        }
    };
};
exports.validate = validate;
// Утилита для создания схемы только для body
const validateBody = (schema) => {
    return (0, exports.validate)(zod_1.z.object({ body: schema }));
};
exports.validateBody = validateBody;
// Утилита для создания схемы только для query
const validateQuery = (schema) => {
    return (0, exports.validate)(zod_1.z.object({ query: schema }));
};
exports.validateQuery = validateQuery;
// Утилита для создания схемы только для params
const validateParams = (schema) => {
    return (0, exports.validate)(zod_1.z.object({ params: schema }));
};
exports.validateParams = validateParams;
