import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models';
import { getClientIP } from '@/utils/validation';

const pollVoteHistory = new Set<string>();

function getPollVoteKey(postId: string, ip: string): string {
  return `${postId}:${ip}`;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { postId, optionId } = await request.json();
    const ip = getClientIP(request);

    if (!postId || !optionId) {
      return NextResponse.json({ error: 'postId and optionId are required' }, { status: 400 });
    }

    const voteKey = getPollVoteKey(postId, ip);
    if (pollVoteHistory.has(voteKey)) {
      return NextResponse.json({ error: 'You already voted on this poll' }, { status: 403 });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (!post.poll || !Array.isArray(post.poll.options) || post.poll.options.length === 0) {
      return NextResponse.json({ error: 'Poll not found for this post' }, { status: 404 });
    }

    const selectedOption = post.poll.options.find((option: { id: string }) => option.id === optionId);
    if (!selectedOption) {
      return NextResponse.json({ error: 'Invalid poll option' }, { status: 400 });
    }

    selectedOption.votes += 1;
    post.poll.totalVotes = post.poll.options.reduce(
      (sum: number, option: { votes: number }) => sum + option.votes,
      0
    );

    await post.save();
    pollVoteHistory.add(voteKey);

    return NextResponse.json({
      poll: post.poll,
    });
  } catch (error) {
    console.error('Error voting on poll:', error);
    return NextResponse.json({ error: 'Failed to vote on poll' }, { status: 500 });
  }
}
