import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models';
import { verifyAdminFromRequest } from '@/lib/admin-auth';
import { deletePostAndImage } from '@/lib/post-cleanup';

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyAdminFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    await deletePostAndImage(postId);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!verifyAdminFromRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { postId, action } = await request.json();

    if (!postId || !['hide', 'unhide'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const post = await Post.findByIdAndUpdate(
      postId,
      { hidden: action === 'hide' },
      { new: true }
    );

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
