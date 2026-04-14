import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post, Feedback } from '@/models';
import { verifyAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const totalPosts = await Post.countDocuments();
    const reportedPosts = await Post.countDocuments({ reports: { $gt: 0 } });
    const hiddenPosts = await Post.countDocuments({ hidden: true });
    const feedbackCount = await Feedback.countDocuments();

    return NextResponse.json({
      totalPosts,
      reportedPosts,
      hiddenPosts,
      feedbackCount,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
