import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models';
import { verifyAdminFromRequest } from '@/lib/admin-auth';
import { cleanupExpiredPosts, deletePostAndImage } from '@/lib/post-cleanup';

type MongoQuery = Record<string, unknown>;
type SortQuery = Record<string, 1 | -1>;
type AdminPostItem = {
  upvotes: number;
  downvotes: number;
} & Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    await cleanupExpiredPosts();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'reported'; // reported, hidden, recent
    const queryText = searchParams.get('q')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    let query: MongoQuery = {};
    let sort: SortQuery = { reports: -1, createdAt: -1 };
    if (filter === 'reported') {
      query = { reports: { $gt: 0 } };
    } else if (filter === 'most-reported') {
      query = { reports: { $gt: 0 } };
      sort = { reports: -1, createdAt: -1 };
    } else if (filter === 'hidden') {
      query = { hidden: true };
      sort = { createdAt: -1 };
    } else if (filter === 'recent') {
      sort = { createdAt: -1 };
    }

    if (queryText.length >= 2) {
      query = {
        ...query,
        content: { $regex: queryText, $options: 'i' },
      };
    }

    const posts = await Post.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(query);

    return NextResponse.json({
      posts: (posts as AdminPostItem[]).map((post) => ({
        ...post,
        score: post.upvotes - post.downvotes,
      })),
      total,
      page,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'recent';
    const queryText = searchParams.get('q')?.trim() || '';

    let query: MongoQuery = {};
    if (filter === 'most-reported') {
      query = { reports: { $gt: 0 } };
    } else if (filter === 'hidden') {
      query = { hidden: true };
    }

    if (queryText.length >= 2) {
      query = {
        ...query,
        content: { $regex: queryText, $options: 'i' },
      };
    }

    const posts = await Post.find(query).select('_id');

    for (const post of posts) {
      await deletePostAndImage(String(post._id));
    }

    return NextResponse.json({ deleted: posts.length });
  } catch (error) {
    console.error('Error deleting posts:', error);
    return NextResponse.json({ error: 'Failed to delete posts' }, { status: 500 });
  }
}
