import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUser.use-case';
import { LoginUserUseCase } from '../../application/use-cases/LoginUser.use-case';
import { UserResponseMapper } from '../../application/dto/user-response.dto';
import { TokenService } from '../../domain/ports/TokenService.port';
import { UserRepository } from '../../domain/ports/UserRepository.port';
export declare class AuthController {
    private readonly registerUserUseCase;
    private readonly loginUserUseCase;
    private readonly userResponseMapper;
    private readonly tokenService;
    private readonly userRepository;
    constructor(registerUserUseCase: RegisterUserUseCase, loginUserUseCase: LoginUserUseCase, userResponseMapper: UserResponseMapper, tokenService: TokenService, userRepository: UserRepository);
    login(req: Request, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
    validateToken(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    generate2FA(_req: Request, res: Response): Promise<void>;
    verify2FA(_req: Request, res: Response): Promise<void>;
    disable2FA(_req: Request, res: Response): Promise<void>;
    healthCheck(_req: Request, res: Response): Promise<void>;
}
