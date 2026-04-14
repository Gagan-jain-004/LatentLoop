import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models';
import { getClientIP } from '@/utils/validation';

// Store vote history in-memory (use Redis in production)
const voteHistory = new Set<string>();

function getVoteKey(postId: string, ip: string): string {
  return `${postId}:${ip}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { postId, type } = await request.json();
    const ip = getClientIP(request);

    if (!postId || !['upvote', 'downvote'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const voteKey = getVoteKey(postId, ip);

    // Simple check - in production, store vote receipts in Redis/DB.
    if (voteHistory.has(voteKey)) {
      return NextResponse.json({ error: 'You already voted on this post' }, { status: 403 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (type === 'upvote') {
      post.upvotes += 1;
    } else {
      post.downvotes += 1;
    }

    post.score = post.upvotes - post.downvotes;

    await post.save();
    voteHistory.add(voteKey);

    return NextResponse.json({
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      score: post.score,
    });
  } catch (error) {
    console.error('Error voting:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
