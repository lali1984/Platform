import { IsEmail, IsString, MinLength, MaxLength, Matches, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Имя пользователя (уникальное, необязательное)',
    required: false
  })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Имя пользователя должно быть минимум 3 символа' })
  @MaxLength(30, { message: 'Имя пользователя должно быть не длиннее 30 символов' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Имя пользователя может содержать только буквы, цифры и подчеркивания'
  })
  username?: string;

  @ApiProperty({
    example: 'John',
    description: 'Имя (необязательное)',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Имя должно быть не длиннее 50 символов' })
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Фамилия (необязательное)',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Фамилия должна быть не длиннее 50 символов' })
  lastName?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
    required: true
  })
  @IsEmail({}, { message: 'Неверный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  @MaxLength(255, { message: 'Email должен быть не длиннее 255 символов' })
  email!: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Пароль (минимум 8 символов, заглавная буква, строчная буква, цифра)',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(8, { message: 'Пароль должен быть минимум 8 символов' })
  @MaxLength(100, { message: 'Пароль должен быть не более 100 символов' })
  @Matches(/(?=.*[a-z])/, {
    message: 'Пароль должен содержать хотя бы одну строчную букву'
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Пароль должен содержать хотя бы одну заглавную букву'
  })
  @Matches(/(?=.*\d)/, {
    message: 'Пароль должен содержать хотя бы одну цифру'
  })
  password!: string;
}