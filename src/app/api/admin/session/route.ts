import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const admin = verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, admin });
}
