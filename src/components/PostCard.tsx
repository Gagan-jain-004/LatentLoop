'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getRelativeTime } from '@/utils/validation';
import EmojiStickerPicker from './EmojiStickerPicker';

interface Post {
  _id: string;
  content: string;
  imageUrl?: string;
  upvotes: number;
  downvotes: number;
  reports: number;
  hidden: boolean;
  score: number;
  commentCount?: number;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onVote?: () => void;
}

interface CommentItem {
  _id: string;
  content: string;
  createdAt: string;
}

export default function PostCard({ post, onVote }: PostCardProps) {
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [isVoting, setIsVoting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEmojiKitOpen, setIsEmojiKitOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState<'up' | 'down' | null>(null);
  const [hasReported, setHasReported] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const storedVote = localStorage.getItem(`vote:${post._id}`) as 'up' | 'down' | null;
    const storedReport = localStorage.getItem(`report:${post._id}`);
    if (storedVote === 'up' || storedVote === 'down') {
      setHasVoted(storedVote);
    }
    if (storedReport === '1') {
      setHasReported(true);
    }
  }, [post._id]);

  useEffect(() => {
    if (!isImageOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsImageOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isImageOpen]);

  useEffect(() => {
    if (!isCommentsOpen) {
      return;
    }

    const loadComments = async () => {
      setIsLoadingComments(true);
      try {
        const response = await axios.get(`/api/posts/comments?postId=${post._id}&page=1`);
        setComments(response.data.comments);
        setHasMoreComments(response.data.hasMore);
        setCommentPage(1);
        setCommentCount(response.data.total || response.data.comments.length || 0);
      } catch (error) {
        console.error('Error loading comments:', error);
        toast.error('Failed to load comments');
      } finally {
        setIsLoadingComments(false);
      }
    };

    loadComments();
  }, [isCommentsOpen, post._id]);

  const commentCountLabel = useMemo(() => `${comments.length}${hasMoreComments ? '+' : ''}`, [comments.length, hasMoreComments]);

  const insertCommentText = (value: string) => {
    setNewComment((current) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return `${current}${value}`.slice(0, 300);
      }

      const start = textarea.selectionStart ?? current.length;
      const end = textarea.selectionEnd ?? current.length;
      const updated = `${current.slice(0, start)}${value}${current.slice(end)}`.slice(0, 300);

      requestAnimationFrame(() => {
        textarea.focus();
        const cursor = Math.min(start + value.length, updated.length);
        textarea.setSelectionRange(cursor, cursor);
      });

      return updated;
    });
  };

  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newComment.trim()) {
      toast.error('Write a comment first');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await axios.post('/api/posts/comments', {
        postId: post._id,
        content: newComment,
      });

      setComments((current) => [response.data, ...current]);
      setCommentCount((current) => current + 1);
      setNewComment('');
      toast.success('Comment posted');
    } catch (error: unknown) {
      console.error('Error posting comment:', error);
      if (axios.isAxiosError<{ error?: string }>(error)) {
        toast.error(error.response?.data?.error || 'Failed to post comment');
      } else {
        toast.error('Failed to post comment');
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const loadMoreComments = async () => {
    try {
      const nextPage = commentPage + 1;
      const response = await axios.get(`/api/posts/comments?postId=${post._id}&page=${nextPage}`);
      setComments((current) => [...current, ...response.data.comments]);
      setHasMoreComments(response.data.hasMore);
      setCommentPage(nextPage);
    } catch (error) {
      console.error('Error loading more comments:', error);
      toast.error('Failed to load more comments');
    }
  };

  const score = upvotes - downvotes;

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (hasVoted) {
      toast.error('You already voted on this post');
      return;
    }

    setIsVoting(true);
    try {
      const response = await axios.post('/api/posts/vote', { postId: post._id, type });
      setUpvotes(response.data.upvotes);
      setDownvotes(response.data.downvotes);
      const voteType = type === 'upvote' ? 'up' : 'down';
      setHasVoted(voteType);
      localStorage.setItem(`vote:${post._id}`, voteType);
      toast.success(`${type === 'upvote' ? '👍' : '👎'} Vote recorded!`);
      onVote?.();
    } catch (error: unknown) {
      console.error('Error voting:', error);
      if (axios.isAxiosError<{ error?: string }>(error)) {
        toast.error(error.response?.data?.error || 'Failed to vote');
      } else {
        toast.error('Failed to vote');
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleReport = async () => {
    if (hasReported) {
      toast.error('You already reported this post');
      return;
    }

    setIsReporting(true);
    try {
      await axios.post('/api/posts/report', { postId: post._id });
      setHasReported(true);
      localStorage.setItem(`report:${post._id}`, '1');
      toast.success('Post reported. Thank you! 🙏');
    } catch (error: unknown) {
      console.error('Error reporting:', error);
      if (axios.isAxiosError<{ error?: string }>(error)) {
        toast.error(error.response?.data?.error || 'Failed to report');
      } else {
        toast.error('Failed to report');
      }
    } finally {
      setIsReporting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#post-${post._id}`;
    const shareData = {
      title: 'RTU Got Latent',
      text: post.content.length > 120 ? `${post.content.slice(0, 120)}...` : post.content,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Post link copied to clipboard');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Post link copied to clipboard');
      } catch {
        toast.error('Unable to share post');
      }
    }
  };

  if (post.hidden) {
    return (
      <div className="surface rounded-2xl p-5 text-center text-slate-600 dark:text-slate-300">
        This post has been hidden due to reports
      </div>
    );
  }

  return (
    <motion.div
      id={`post-${post._id}`}
      className="surface rounded-3xl border border-sky-200/70 p-5 transition-all hover:-translate-y-0.5 dark:border-slate-700/75"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-3">
        <p className="text-base leading-relaxed text-slate-800 dark:text-slate-100">{post.content}</p>
      </div>

      {post.imageUrl && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-sky-200/70 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setIsImageOpen(true)}
            className="block w-full cursor-zoom-in text-left"
            aria-label="Open image in full view"
          >
            <img src={post.imageUrl} alt="Post attachment" className="max-h-115 w-full object-cover" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {isImageOpen && post.imageUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageOpen(false)}
          >
            <motion.div
              className="relative flex h-full w-full max-w-6xl items-center justify-center"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsImageOpen(false)}
                className="absolute right-0 top-0 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-white/20"
                aria-label="Close image viewer"
              >
                Close
              </button>

              <img
                src={post.imageUrl}
                alt="Post attachment enlarged"
                className="max-h-[calc(100vh-2rem)] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{getRelativeTime(new Date(post.createdAt))}</span>

        {post.reports > 0 && (
          <span className="rounded-full bg-rose-500/10 px-2 py-1 font-semibold text-rose-600 dark:text-rose-300">🚩 {post.reports} report{post.reports > 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sky-200/60 pt-3 dark:border-slate-700/80">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => handleVote('upvote')}
            disabled={isVoting || hasVoted !== null}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm transition-all ${
              hasVoted === 'up'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'text-slate-600 hover:bg-cyan-50 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>⬆️</span>
            <span className="font-semibold">{upvotes}</span>
          </motion.button>

          <motion.button
            onClick={() => handleVote('downvote')}
            disabled={isVoting || hasVoted !== null}
            className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm transition-all ${
              hasVoted === 'down'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : 'text-slate-600 hover:bg-cyan-50 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>⬇️</span>
            <span className="font-semibold">{downvotes}</span>
          </motion.button>

          <span className={`ml-2 rounded-full px-2 py-1 font-bold text-sm ${score > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : score < 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300' : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'}`}>
            {score > 0 ? '+' : ''}{score}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setIsCommentsOpen((current) => !current)}
            className="rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-600 transition-all hover:bg-cyan-50 dark:text-slate-300 dark:hover:bg-slate-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            💬 {isCommentsOpen ? 'Close' : 'Comment'} ({commentCount})
          </motion.button>

          <motion.button
            onClick={handleShare}
            className="rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-600 transition-all hover:bg-cyan-50 dark:text-slate-300 dark:hover:bg-slate-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔗 Share
          </motion.button>

          <motion.button
            onClick={handleReport}
            disabled={isReporting || hasReported}
            className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition-all ${
              hasReported
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : 'text-slate-600 hover:bg-cyan-50 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚩 {hasReported ? 'Reported' : 'Report'}
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isCommentsOpen && (
          <motion.div
            className="mt-4 border-t border-sky-200/60 pt-4 dark:border-slate-700/80"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Comments</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{commentCount} total comment{commentCount === 1 ? '' : 's'}</p>
              </div>
              <span className="rounded-full bg-slate-500/10 px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {commentCountLabel}
              </span>
            </div>

            <form onSubmit={handleCommentSubmit} className="mb-4 space-y-3">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(event) => setNewComment(event.target.value.slice(0, 300))}
                  className="min-h-24 w-full resize-none rounded-2xl border border-sky-200 bg-white/80 p-4 pr-16 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/35 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
                  placeholder="Write a reply..."
                  disabled={isSubmittingComment}
                />

                <div className="absolute bottom-3 right-3">
                  <motion.button
                    type="button"
                    onClick={() => setIsEmojiKitOpen((current) => !current)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-200 bg-white text-lg shadow-md hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-expanded={isEmojiKitOpen}
                    aria-label="Open emoji picker"
                    title="Emojis"
                  >
                    😊
                  </motion.button>

                  {isEmojiKitOpen && (
                    <div className="absolute bottom-12 right-0 z-20 w-72 max-w-[calc(100vw-2rem)] shadow-2xl">
                      <EmojiStickerPicker onPick={insertCommentText} compact />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">Anonymous reply</span>
                <motion.button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmittingComment ? 'Posting...' : 'Reply'}
                </motion.button>
              </div>
            </form>

            <div className="space-y-3">
              {isLoadingComments ? (
                <div className="space-y-3">
                  <div className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                  <div className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                </div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/70 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                  No comments yet. Be the first.
                </div>
              ) : (
                comments.map((comment) => (
                  <motion.div
                    key={comment._id}
                    className="rounded-2xl border border-sky-200/70 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-900/70"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-100">
                      {comment.content}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {getRelativeTime(new Date(comment.createdAt))}
                    </p>
                  </motion.div>
                ))
              )}

              {hasMoreComments && comments.length > 0 && (
                <button
                  type="button"
                  onClick={loadMoreComments}
                  className="w-full rounded-2xl border border-sky-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-sky-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Load more comments
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
