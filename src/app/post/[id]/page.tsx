'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Header, Footer, FeedbackModal } from '@/components';
import PostCard from '@/components/PostCard';
import { Skeleton } from '@/components/Skeleton';

interface Post {
  _id: string;
  content: string;
  imageUrl?: string;
  upvotes: number;
  downvotes: number;
  reports: number;
  hidden: boolean;
  score: number;
  createdAt: string;
  commentCount?: number;
}

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/posts/${postId}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  return (
    <main className="app-shell min-h-screen">
      <Header onFilterChange={() => {}} onPostCreated={() => {}} />

      <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:pt-8">
        {isLoading ? (
          <Skeleton />
        ) : post ? (
          <div className="space-y-4">
            <PostCard post={post} />
          </div>
        ) : (
          <div className="surface rounded-3xl py-14 text-center">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              Post not found 😞
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This post may have been deleted or moved.
            </p>
          </div>
        )}
      </section>

      <Footer onFeedbackClick={() => setIsFeedbackOpen(true)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </main>
  );
}
