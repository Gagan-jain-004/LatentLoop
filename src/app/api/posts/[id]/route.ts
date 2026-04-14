import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post, Comment } from '@/models';
import { Types } from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Validate MongoDB ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findById(id).lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.hidden) {
      return NextResponse.json({ error: 'This post has been hidden' }, { status: 403 });
    }

    // Get comment count
    const commentCount = await Comment.countDocuments({ postId: id });

    return NextResponse.json({
      ...post,
      score: typeof post.score === 'number' ? post.score : post.upvotes - post.downvotes,
      commentCount,
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
