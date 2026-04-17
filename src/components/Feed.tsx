'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import PostCard from './PostCard';
import { Skeleton } from './Skeleton';

interface Post {
  _id: string;
  content: string;
  imageUrl?: string;
  poll?: {
    question: string;
    options: {
      id: string;
      text: string;
      votes: number;
    }[];
    totalVotes: number;
  };
  upvotes: number;
  downvotes: number;
  reports: number;
  hidden: boolean;
  score: number;
  createdAt: string;
}

interface FeedProps {
  filter: string;
  refreshTrigger: number;
  optimisticPost?: Post | null;
}

export default function Feed({ filter, refreshTrigger, optimisticPost }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const isBackgroundRefresh = useRef(false);

  const fetchPosts = useCallback(async () => {
    const shouldShowLoader = !isBackgroundRefresh.current;

    if (shouldShowLoader) {
      setIsLoading(true);
    }

    try {
      const url = `/api/posts?sort=${filter}&page=${page}`;

      const response = await axios.get(url);
      if (page === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts((prev) => [...prev, ...response.data.posts]);
      }
      setHasMore(response.data.hasMore);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
      isBackgroundRefresh.current = false;
    }
  }, [filter, page]);

  useEffect(() => {
    isBackgroundRefresh.current = false;
    setIsLoading(true);
    setPage(1);
    setPosts([]);
    setHasMore(true);
  }, [filter]);

  useEffect(() => {
    if (refreshTrigger === 0) {
      return;
    }

    isBackgroundRefresh.current = true;
    setPage(1);
  }, [refreshTrigger]);

  useEffect(() => {
    if (!optimisticPost) {
      return;
    }

    setPosts((current) => {
      if (current.some((post) => post._id === optimisticPost._id)) {
        return current;
      }

      return [optimisticPost, ...current];
    });
  }, [optimisticPost]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoading]);

  return (
    <div className="space-y-4">
      {posts.length === 0 && !isLoading && (
        <motion.div
          className="surface rounded-3xl py-14 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            No posts yet. Be the first! 🚀
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Fresh takes will appear here instantly.</p>
        </motion.div>
      )}

      <motion.div layout className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <PostCard post={post} onVote={(fetchPosts)} />
          </motion.div>
        ))}
      </motion.div>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} />
          ))}
        </div>
      )}

      <div ref={observerTarget} className="py-4 text-center">
        {!hasMore && posts.length > 0 && (
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">That&apos;s all for now! 👋</p>
        )}
      </div>
    </div>
  );
}
