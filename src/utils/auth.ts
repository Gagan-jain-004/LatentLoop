import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

// Simple in-memory rate limiting (for production use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export interface AdminTokenPayload {
  role: 'admin';
  username?: string;
}

export function buildRateLimitKey(scope: string, id: string): string {
  return `${scope}:${id}`;
}

export function checkRateLimit(key: string, limit: number = 1, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count < limit) {
    record.count++;
    return true;
  }

  return false;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function getJwtSecret(): Secret {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
}

export function generateToken(data: AdminTokenPayload, expiresIn: SignOptions['expiresIn'] = '7d'): string {
  return jwt.sign(data, getJwtSecret(), { expiresIn });
}

export function verifyToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'role' in decoded &&
      decoded.role === 'admin'
    ) {
      return decoded as AdminTokenPayload;
    }

    return null;
  } catch {
    return null;
  }
}
