import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredPosts } from '@/lib/post-cleanup';

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await cleanupExpiredPosts();
    return NextResponse.json({ message: 'Cleanup completed', ...result });
  } catch (error) {
    console.error('Error running cleanup:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
