'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getRelativeTime } from '@/utils/validation';
import EmojiStickerPicker from './EmojiStickerPicker';

interface CommentItem {
  _id: string;
  content: string;
  createdAt: string;
}

interface PostCommentsModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostCommentsModal({ postId, isOpen, onClose }: PostCommentsModalProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmojiKitOpen, setIsEmojiKitOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const loadComments = async (nextPage: number = 1, append: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/posts/comments?postId=${postId}&page=${nextPage}`);
      setComments((prev) => (append ? [...prev, ...response.data.comments] : response.data.comments));
      setHasMore(response.data.hasMore);
      setTotal(response.data.total);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setComments([]);
    setNewComment('');
    setIsEmojiKitOpen(false);
    setPage(1);
    setHasMore(true);
    loadComments(1, false);
  }, [isOpen, postId]);

  const insertText = (value: string) => {
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newComment.trim()) {
      toast.error('Write a comment first');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/posts/comments', {
        postId,
        content: newComment,
      });

      setComments((current) => [response.data, ...current]);
      setNewComment('');
      setTotal((current) => current + 1);
      toast.success('Comment posted');
    } catch (error: unknown) {
      console.error('Error posting comment:', error);
      if (axios.isAxiosError<{ error?: string }>(error)) {
        toast.error(error.response?.data?.error || 'Failed to post comment');
      } else {
        toast.error('Failed to post comment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = useMemo(() => `Comments (${total})`, [total]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-slate-700">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Anonymous replies and reactions</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full px-3 py-1 text-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="grid flex-1 gap-0 overflow-hidden md:grid-cols-[1.15fr_0.85fr]">
                <div className="flex min-h-0 flex-col border-b border-gray-200 dark:border-slate-700 md:border-b-0 md:border-r">
                  <div className="flex-1 overflow-y-auto p-5">
                    {isLoading && comments.length === 0 ? (
                      <div className="space-y-3">
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800" />
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800" />
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100 dark:bg-slate-800" />
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950/40">
                        <div>
                          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">No comments yet</p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Be the first to drop an emoji or reply.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <motion.div
                            key={comment._id}
                            className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/80"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-900 dark:text-gray-100">
                              {comment.content}
                            </p>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {getRelativeTime(new Date(comment.createdAt))}
                            </p>
                          </motion.div>
                        ))}

                        {hasMore && (
                          <button
                            type="button"
                            onClick={() => loadComments(page + 1, true)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-800"
                          >
                            Load more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex min-h-0 flex-col bg-gray-50/70 p-5 dark:bg-slate-950/40">
                  <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4">
                    <div className="relative">
                      <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Add a comment
                      </label>
                      <textarea
                        ref={textareaRef}
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value.slice(0, 300))}
                        className="min-h-32 w-full resize-none rounded-xl border border-gray-200 bg-white p-4 pr-16 text-sm text-gray-900 outline-none ring-0 focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        placeholder="Drop an emoji or a thought..."
                        disabled={isSubmitting}
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{newComment.length}/300</span>
                        <span>Anonymous comment</span>
                      </div>

                      <div className="absolute bottom-10 right-3">
                        <motion.button
                          type="button"
                          onClick={() => setIsEmojiKitOpen((current) => !current)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-lg shadow-md hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
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
                            <EmojiStickerPicker onPick={insertText} compact />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-200 dark:hover:bg-slate-800"
                      >
                        Close
                      </button>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="flex-1 rounded-xl bg-linear-to-r from-cyan-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSubmitting ? 'Posting...' : 'Post comment'}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}