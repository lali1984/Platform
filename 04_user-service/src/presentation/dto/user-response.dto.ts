import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsBoolean, IsDate, IsOptional, IsEnum, IsObject } from 'class-validator';
import { UserStatus } from '../../domain/entities/user-profile';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  id?: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: 'ACTIVE', enum: UserStatus })
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ example: { theme: 'dark', language: 'en' }, required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  createdAt?: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  @IsDate()
  updatedAt?: Date;

  @ApiProperty({ example: '2024-01-02T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}