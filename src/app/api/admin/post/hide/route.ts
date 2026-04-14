import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models';
import { verifyAdminFromRequest } from '@/lib/admin-auth';

export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdminFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { postId, hidden } = await request.json();

    if (!postId || typeof hidden !== 'boolean') {
      return NextResponse.json({ error: 'postId and hidden are required' }, { status: 400 });
    }

    const post = await Post.findByIdAndUpdate(postId, { hidden }, { new: true });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      post,
      message: hidden ? 'Post hidden' : 'Post unhidden',
    });
  } catch (error) {
    console.error('Error hiding post:', error);
    return NextResponse.json({ error: 'Failed to update post visibility' }, { status: 500 });
  }
}
