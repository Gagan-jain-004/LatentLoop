import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Comment, Post } from '@/models';
import { sanitizeInput, validatePostContent, getClientIP, calculateExpiryDate } from '@/utils/validation';
import { buildRateLimitKey, checkRateLimit } from '@/utils/auth';
import { verifyCaptchaToken } from '@/lib/captcha';
import cloudinary from '@/lib/cloudinary';
import { cleanupExpiredPosts } from '@/lib/post-cleanup';

type SortQuery = Record<string, 1 | -1>;
type PostListItem = {
  upvotes: number;
  downvotes: number;
  commentCount?: number;
  score?: number;
} & Record<string, unknown>;

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    await cleanupExpiredPosts();

    const formData = await request.formData();
    const content = String(formData.get('content') || '');
    const captchaToken = String(formData.get('captchaToken') || '');
    const imageFile = formData.get('image');
    const ip = getClientIP(request);
    const limiterKey = buildRateLimitKey('post-create', ip);

    // Check rate limiting
    if (!checkRateLimit(limiterKey, 1, 30000)) {
      return NextResponse.json(
        { error: 'Too many posts. Please wait before posting again.' },
        { status: 429 }
      );
    }

    const captchaOk = await verifyCaptchaToken(captchaToken);
    if (!captchaOk) {
      return NextResponse.json({ error: 'CAPTCHA verification failed' }, { status: 400 });
    }

    // Validate content
    const validation = validatePostContent(content);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitized = sanitizeInput(content);

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (imageFile instanceof File && imageFile.size > 0) {
      if (!imageFile.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
      }

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'rtu-got-latent/posts',
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Failed to upload image'));
              return;
            }

            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          }
        );

        uploadStream.end(buffer);
      });

      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.public_id;
    }

    const post = await Post.create({
      content: sanitized,
      imageUrl,
      imagePublicId,
      expiresAt: calculateExpiryDate(),
      score: 0,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    await cleanupExpiredPosts();

    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'latest'; // latest, trending, top
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    let sortOption: SortQuery = { createdAt: -1 };
    if (sort === 'trending') {
      sortOption = { score: -1, createdAt: -1 };
    } else if (sort === 'top') {
      sortOption = { upvotes: -1, createdAt: -1 };
    }

    const posts = await Post.find({ hidden: false })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    const postIds = (posts as PostListItem[]).map((post) => post._id).filter(Boolean);
    const commentCounts = postIds.length
      ? await Comment.aggregate([
          { $match: { postId: { $in: postIds } } },
          { $group: { _id: '$postId', count: { $sum: 1 } } },
        ])
      : [];

    const commentCountMap = new Map<string, number>(
      commentCounts.map((item: { _id: unknown; count: number }) => [String(item._id), item.count])
    );

    const total = await Post.countDocuments({ hidden: false });

    return NextResponse.json({
      posts: (posts as PostListItem[]).map((post) => ({
        ...post,
        score: typeof post.score === 'number' ? post.score : post.upvotes - post.downvotes,
        commentCount: commentCountMap.get(String(post._id)) || 0,
      })),
      total,
      page,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
