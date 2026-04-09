import type { JWTPayload } from 'jose';

export interface AuthenticatedRequestUser {
  userId: string;
  email: string;
  jwt: JWTPayload;
}
