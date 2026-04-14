'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please write some feedback');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('/api/feedback', { message });
      toast.success('Thank you for your feedback! 💙');
      setMessage('');
      onClose();
    } catch (error: unknown) {
      console.error('Error submitting feedback:', error);
      if (axios.isAxiosError<{ error?: string }>(error)) {
        toast.error(error.response?.data?.error || 'Failed to submit feedback');
      } else {
        toast.error('Failed to submit feedback');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <motion.div className="surface-strong w-full max-w-md rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">📝 Send Feedback</h2>
                <button
                  onClick={onClose}
                  className="rounded-xl px-3 py-1 text-2xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                  placeholder="Tell us what you think..."
                  className="h-32 w-full resize-none rounded-2xl border border-sky-200 bg-white/85 p-4 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/35 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
                  disabled={isLoading}
                />

                <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                  {message.length}/1000
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-sky-200 px-4 py-2 font-semibold text-slate-700 transition-all hover:bg-sky-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="btn-primary flex-1 rounded-xl disabled:cursor-not-allowed disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isLoading ? 'Sending...' : 'Send Feedback'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
