'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getRelativeTime } from '@/utils/validation';
import { useSearchParams } from 'next/navigation';

interface Post {
  _id: string;
  content: string;
  upvotes: number;
  downvotes: number;
  reports: number;
  hidden: boolean;
  createdAt: string;
}

export default function AdminPostsManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('filter') || 'recent');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/admin/posts?filter=${encodeURIComponent(filter)}&q=${encodeURIComponent(query)}&page=${page}`
      );
      setPosts(response.data.posts);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [filter, page, query]);

  useEffect(() => {
    const nextFilter = searchParams.get('filter') || 'recent';
    const nextQuery = searchParams.get('q') || '';
    setFilter(nextFilter);
    setQuery(nextQuery);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;

    try {
      await axios.delete(`/api/admin/post/${postId}`);
      setPosts(posts.filter((p) => p._id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteAll = async () => {
    if (!posts.length) return;
    if (!confirm(`Delete all ${posts.length} posts in this view?`)) return;

    try {
      await axios.delete(
        `/api/admin/posts?filter=${encodeURIComponent(filter)}&q=${encodeURIComponent(query)}`
      );
      setPosts([]);
      setTotal(0);
      toast.success('All posts deleted');
    } catch (error) {
      console.error('Error deleting all posts:', error);
      toast.error('Failed to delete all posts');
      fetchPosts();
    }
  };

  const handleHide = async (postId: string, hidden: boolean) => {
    try {
      await axios.patch('/api/admin/post/hide', {
        postId,
        hidden: !hidden,
      });
      setPosts(posts.map((p) => (p._id === postId ? { ...p, hidden: !hidden } : p)));
      toast.success(hidden ? 'Post unhidden' : 'Post hidden');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="mb-4 text-3xl font-black text-slate-900 dark:text-white">🚩 Manage Posts</h1>

        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Showing all posts. Use the controls below to delete one post or clear everything in this view.
        </p>

        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search posts by text..."
            className="w-full rounded-2xl border border-sky-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/35 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
          />

          <div className="text-sm text-slate-500 dark:text-slate-400 md:text-right">
            {total} matching post{total === 1 ? '' : 's'}
          </div>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['recent', 'most-reported', 'hidden'].map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`rounded-2xl border px-4 py-2 font-semibold transition-all ${
                filter === f
                  ? 'border-cyan-500 bg-linear-to-r from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'surface border-sky-200/60 text-slate-700 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {f === 'recent'
                ? 'All Posts'
                : f === 'most-reported'
                  ? 'Most Reported'
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">Total loaded: {posts.length}</span>
          <motion.button
            type="button"
            onClick={handleDeleteAll}
            disabled={!posts.length}
            className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Delete All in View
          </motion.button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-600 dark:text-slate-300">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="surface rounded-3xl py-12 text-center text-slate-500 dark:text-slate-400">No posts found</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <motion.div
              key={post._id}
              className="surface rounded-2xl border border-sky-200/65 p-4 dark:border-slate-700"
              whileHover={{ x: 5 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="mb-2 text-slate-800 dark:text-slate-100">{post.content}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{getRelativeTime(new Date(post.createdAt))}</span>
                    <span>•</span>
                    <span>⬆️ {post.upvotes}</span>
                    <span>⬇️ {post.downvotes}</span>
                    {post.reports > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-500 font-semibold">🚩 {post.reports}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleHide(post._id, post.hidden)}
                    className={`rounded-xl px-3 py-1 text-sm font-semibold ${
                      post.hidden
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {post.hidden ? '👁️ Unhide' : '👁️ Hide'}
                  </motion.button>

                  <motion.button
                    onClick={() => handleDelete(post._id)}
                    className="rounded-xl bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900/30"
                    whileHover={{ scale: 1.1 }}
                  >
                    🗑️ Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1 || isLoading}
          className="rounded-2xl border border-sky-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
        >
          Previous
        </button>

        <div className="text-sm text-slate-500 dark:text-slate-400">Page {page}</div>

        <button
          type="button"
          onClick={() => setPage((current) => current + 1)}
          disabled={isLoading || posts.length < 20}
          className="rounded-2xl border border-sky-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}
