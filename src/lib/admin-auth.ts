import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { verifyToken, type AdminTokenPayload } from '@/utils/auth';

const ADMIN_COOKIE_NAME = 'adminToken';

export function verifyAdminFromRequest(request: NextRequest): AdminTokenPayload | null {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifyToken(token);
}

export async function verifyAdminFromServerCookies(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifyToken(token);
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
};

export const ADMIN_COOKIE_NAME_VALUE = ADMIN_COOKIE_NAME;
