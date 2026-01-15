// src/types/register.dto.ts
export class RegisterDto {
  email!: string;
  password!: string;
  confirmPassword?: string; // ⬅️ сделать необязательным
}
