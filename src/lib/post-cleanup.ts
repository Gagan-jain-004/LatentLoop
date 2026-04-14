import cloudinary from '@/lib/cloudinary';
import { connectToDatabase } from '@/lib/mongodb';
import { Post } from '@/models';

export async function cleanupExpiredPosts() {
  await connectToDatabase();

  const now = new Date();
  const expiredPosts = await Post.find({ expiresAt: { $lte: now } }).select('_id imagePublicId');

  if (expiredPosts.length === 0) {
    return { cleaned: 0 };
  }

  for (const post of expiredPosts) {
    if (post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
      } catch (error) {
        console.error('Error deleting expired post image from Cloudinary:', error);
      }
    }
  }

  await Post.deleteMany({ _id: { $in: expiredPosts.map((post) => post._id) } });

  return { cleaned: expiredPosts.length };
}

export async function deletePostAndImage(postId: string) {
  await connectToDatabase();

  const post = await Post.findById(postId).select('imagePublicId');
  if (!post) {
    return null;
  }

  if (post.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(post.imagePublicId);
    } catch (error) {
      console.error('Error deleting post image from Cloudinary:', error);
    }
  }

  await Post.findByIdAndDelete(postId);
  return post;
}
