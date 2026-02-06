import { IsEmail, IsString, IsOptional, IsBoolean, IsEnum, ValidateIf } from 'class-validator';
import { UserStatus } from '../../domain/entities/user-profile';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  authUserId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}