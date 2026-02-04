// 02_bff-gateway/src/presentation/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ApiResponse } from '../../domain/value-objects/api-response.vo';

export const validate = (schema: z.ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        
        res.status(400).json(
          ApiResponse.error('Validation failed', errors).toJSON()
        );
      } else {
        res.status(500).json(
          ApiResponse.error('Internal server error').toJSON()
        );
      }
    }
  };
};

// Утилита для создания схемы только для body
export const validateBody = (schema: z.ZodType<any>) => {
  return validate(z.object({ body: schema }));
};

// Утилита для создания схемы только для query
export const validateQuery = (schema: z.ZodType<any>) => {
  return validate(z.object({ query: schema }));
};

// Утилита для создания схемы только для params
export const validateParams = (schema: z.ZodType<any>) => {
  return validate(z.object({ params: schema }));
};