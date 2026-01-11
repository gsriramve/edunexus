export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string | null;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  success: boolean;
}
