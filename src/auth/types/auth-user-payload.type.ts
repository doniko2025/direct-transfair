// apps/backend/src/auth/types/auth-user-payload.type.ts
export type AuthUserPayload = {
  id: string;
  sub?: string;
  email?: string;
  role?: string;
  clientId?: number;
};
