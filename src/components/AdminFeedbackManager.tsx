'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getRelativeTime } from '@/utils/validation';

interface Feedback {
  _id: string;
  message: string;
  createdAt: string;
}

export default function AdminFeedbackManager() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const page = 1;

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/admin/feedback?page=${page}`);
      setFeedbacks(response.data.feedbacks);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleDelete = async (feedbackId: string) => {
    if (!confirm('Delete this feedback?')) return;

    try {
      await axios.delete(`/api/admin/feedback/${feedbackId}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== feedbackId));
      toast.success('Feedback deleted');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="mb-4 text-3xl font-black text-slate-900 dark:text-white">💬 Feedback</h1>
        <p className="text-slate-600 dark:text-slate-300">User feedback and suggestions</p>
      </motion.div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-600 dark:text-slate-300">Loading feedback...</div>
      ) : feedbacks.length === 0 ? (
        <div className="surface rounded-3xl py-12 text-center text-slate-500 dark:text-slate-400">No feedback yet</div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((feedback) => (
            <motion.div
              key={feedback._id}
              className="surface rounded-2xl border border-sky-200/65 p-4 dark:border-slate-700"
              whileHover={{ x: 5 }}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="mb-2 text-slate-800 dark:text-slate-100">{feedback.message}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{getRelativeTime(new Date(feedback.createdAt))}</p>
                </div>

                <motion.button
                  onClick={() => handleDelete(feedback._id)}
                  className="rounded-xl bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900/30"
                  whileHover={{ scale: 1.1 }}
                >
                  🗑️ Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
