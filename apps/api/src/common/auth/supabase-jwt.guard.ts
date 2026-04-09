import {
  Inject,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { ENVIRONMENT } from '../config/environment.constants.js';
import type { Environment } from '../config/environment.js';
import type { AuthenticatedRequestUser } from './authenticated-user.interface.js';

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

const getRemoteJwks = (jwksUrl: string) => {
  const existing = jwksCache.get(jwksUrl);

  if (existing) {
    return existing;
  }

  const remote = createRemoteJWKSet(new URL(jwksUrl));
  jwksCache.set(jwksUrl, remote);
  return remote;
};

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  constructor(@Inject(ENVIRONMENT) private readonly env: Environment) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ headers: { authorization?: string }; user?: AuthenticatedRequestUser }>();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token.');
    }

    const token = authorization.slice('Bearer '.length).trim();
    const jwks = getRemoteJwks(this.env.supabaseJwksUrl);

    const { payload } = await jwtVerify(token, jwks, {
      audience: this.env.JWT_AUDIENCE,
      issuer: this.env.jwtIssuer,
    });

    if (!payload.sub || typeof payload.email !== 'string') {
      throw new UnauthorizedException('Invalid Supabase token payload.');
    }

    request.user = {
      userId: payload.sub,
      email: payload.email,
      jwt: payload,
    };

    return true;
  }
}
