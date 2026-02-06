import { CreateUserUseCase } from './create-user';
import { UserRegisteredEventDto } from '../dto/user-registered-event';
export declare class HandleUserRegisteredEventUseCase {
    private readonly createUserUseCase;
    private readonly logger;
    private readonly maxRetries;
    private readonly retryDelays;
    constructor(createUserUseCase: CreateUserUseCase);
    execute(event: UserRegisteredEventDto): Promise<void>;
    private validateEvent;
    private executeWithRetry;
    private isDuplicateEvent;
}
