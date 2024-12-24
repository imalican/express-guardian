export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp?: number; // JWT expiration timestamp
  iat?: number; // JWT issued at timestamp
}
