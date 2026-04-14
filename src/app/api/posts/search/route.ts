import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models';

type SearchPostItem = {
  upvotes: number;
  downvotes: number;
  score?: number;
} & Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    if (!query || query.length < 2) {
      return NextResponse.json({
        posts: [],
        total: 0,
        page,
        hasMore: false,
      });
    }

    const posts = await Post.find({ hidden: false, content: { $regex: query, $options: 'i' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({
      hidden: false,
      content: { $regex: query, $options: 'i' },
    });

    return NextResponse.json({
      posts: (posts as SearchPostItem[]).map((post) => ({
        ...post,
        score: typeof post.score === 'number' ? post.score : post.upvotes - post.downvotes,
      })),
      total,
      page,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    return NextResponse.json({ error: 'Failed to search posts' }, { status: 500 });
  }
}
