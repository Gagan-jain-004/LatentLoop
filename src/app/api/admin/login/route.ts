import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/utils/auth';
import { ADMIN_COOKIE_NAME_VALUE, ADMIN_COOKIE_OPTIONS } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password';

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken({ role: 'admin', username: adminUsername }, '7d');

    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set(ADMIN_COOKIE_NAME_VALUE, token, ADMIN_COOKIE_OPTIONS);

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
