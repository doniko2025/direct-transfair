// src/auth/types/auth-user-payload.type.ts
export interface AuthUserPayload {
  sub: string; // id Prisma de l'utilisateur
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
