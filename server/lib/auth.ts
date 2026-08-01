import jwt from 'jsonwebtoken';
import { json } from './cors.ts';

/**
 * Replaces the old express-session setup. Server memory does not survive
 * between serverless invocations, so the signed JWT the client sends on each
 * request is the only source of truth about who is calling.
 *
 * This also closes a hole in the previous version: it trusted plain
 * `X-User-ID` / `X-User-Type` headers, so anyone could claim to be an admin by
 * setting a header. A token has to be signed with JWT_SECRET to be accepted.
 */

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error(
    'JWT_SECRET is not set. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  );
}

const JWT_SECRET: string = secret;
const TOKEN_TTL = '7d';

export type AuthUser = {
  id: number;
  type: 'admin' | 'student';
  name: string;
  reg_no?: string;
  employee_id?: string;
};

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

/** Returns the caller's identity, or null when the token is missing/invalid/expired. */
export function getUser(request: Request): AuthUser | null {
  const header = request.headers.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const payload = jwt.verify(header.slice(7).trim(), JWT_SECRET);

    if (typeof payload === 'string' || !payload.type) {
      return null;
    }

    const { id, type, name, reg_no, employee_id } = payload as jwt.JwtPayload & AuthUser;
    return { id, type, name, reg_no, employee_id };
  } catch {
    // Covers malformed tokens, bad signatures and expiry alike.
    return null;
  }
}

/** Any logged-in user, or a 401 response to return directly from the handler. */
export function requireAuth(request: Request): AuthUser | Response {
  const user = getUser(request);

  if (!user) {
    return json(
      request,
      {
        message: 'Unauthorized. Please login first.',
        details: 'Your session may have expired or you are not logged in.',
      },
      401
    );
  }

  return user;
}

/** An admin, or a 401/403 response to return directly from the handler. */
export function requireAdmin(request: Request): AuthUser | Response {
  const user = requireAuth(request);

  if (user instanceof Response) {
    return user;
  }

  if (user.type !== 'admin') {
    return json(
      request,
      {
        message: 'Access denied. Admin privileges required.',
        details: 'You must be logged in as an administrator to access this resource.',
      },
      403
    );
  }

  return user;
}
