// services/user-service/src/application/dto/update-user.dto.ts
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Jane', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Smith', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'https://example.com/new-avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: { department: 'Marketing' }, required: false })
  @IsOptional()
  metadata?: Record<string, any>;

  // Для аудита
  @ApiHideProperty()
  @IsOptional()
  updatedBy?: string;
}