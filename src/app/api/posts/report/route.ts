import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models';
import { getClientIP } from '@/utils/validation';

// Track reports per post per IP (use database in production)
const reportHistory = new Map<string, Set<string>>();

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { postId } = await request.json();
    const ip = getClientIP(request);
    const threshold = parseInt(process.env.NEXT_PUBLIC_REPORT_THRESHOLD || '5');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already reported by this IP
    const reportKey = `report:${postId}`;
    if (!reportHistory.has(reportKey)) {
      reportHistory.set(reportKey, new Set());
    }

    if (reportHistory.get(reportKey)!.has(ip)) {
      return NextResponse.json({ error: 'You already reported this post' }, { status: 403 });
    }

    post.reports += 1;

    // Auto-hide if threshold exceeded
    if (post.reports > threshold) {
      post.hidden = true;
    }

    await post.save();
    reportHistory.get(reportKey)!.add(ip);

    return NextResponse.json({
      reports: post.reports,
      hidden: post.hidden,
    });
  } catch (error) {
    console.error('Error reporting post:', error);
    return NextResponse.json({ error: 'Failed to report post' }, { status: 500 });
  }
}
