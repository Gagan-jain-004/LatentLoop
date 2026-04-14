import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Comment, Post } from '@/models';
import { getClientIP, sanitizeInput, validateCommentContent } from '@/utils/validation';
import { buildRateLimitKey, checkRateLimit } from '@/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    const comments = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Comment.countDocuments({ postId });

    return NextResponse.json({
      comments,
      total,
      page,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { postId, content } = await request.json();
    const ip = getClientIP(request);
    const rateLimitKey = buildRateLimitKey('comment-create', `${ip}:${postId}`);

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    if (!checkRateLimit(rateLimitKey, 1, 15000)) {
      return NextResponse.json({ error: 'Please wait before commenting again.' }, { status: 429 });
    }

    const post = await Post.findById(postId);
    if (!post || post.hidden) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const validation = validateCommentContent(content);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitized = sanitizeInput(content, 300);

    const comment = await Comment.create({
      postId,
      content: sanitized,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}