import { Request, Response } from 'express';
import { GetUserProfileUseCase } from '../../application/use-cases/get-user-profile.use-case';
import { ApiResponse } from '../../domain/value-objects/api-response.vo';

export class UserController {
  constructor(private readonly getUserProfileUseCase: GetUserProfileUseCase) {}

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = (req as any).token;
      const userId = req.params.userId;

      const result = await this.getUserProfileUseCase.execute(token, userId);

      if (!result.success) {
        res.status(result.error?.includes('Invalid') ? 401 : 404).json(result.toJSON());
        return;
      }

      res.status(200).json(result.toJSON());
    } catch (error) {
      console.error('UserController.getProfile error:', error);
      res.status(500).json(
        ApiResponse.error('Internal server error').toJSON()
      );
    }
  };

  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = (req as any).token;
      const result = await this.getUserProfileUseCase.execute(token);

      if (!result.success) {
        res.status(result.error?.includes('Invalid') ? 401 : 404).json(result.toJSON());
        return;
      }

      res.status(200).json(result.toJSON());
    } catch (error) {
      console.error('UserController.getMyProfile error:', error);
      res.status(500).json(
        ApiResponse.error('Internal server error').toJSON()
      );
    }
  };

  searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, limit } = req.query;
      
      // This would use a SearchUsersUseCase
      // For now, return mock response
      res.status(200).json(
        ApiResponse.success([]).toJSON()
      );
    } catch (error) {
      console.error('UserController.searchUsers error:', error);
      res.status(500).json(
        ApiResponse.error('Internal server error').toJSON()
      );
    }
  };
}