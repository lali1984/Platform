export interface User {
  id: string;
  email: string;
  password_hash: string;
  is_email_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  is_email_verified: boolean;
  two_factor_enabled: boolean;
  created_at: string;
}
