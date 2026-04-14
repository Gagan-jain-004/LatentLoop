'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Stats {
  totalPosts: number;
  reportedPosts: number;
  hiddenPosts: number;
  feedbackCount: number;
}

type StatColor = 'blue' | 'red' | 'orange' | 'teal';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  color: StatColor;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return <div className="py-12 text-center text-slate-600 dark:text-slate-300">Loading...</div>;
  }

  const colorStyles = {
    blue: {
      card: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
      value: 'text-blue-700 dark:text-blue-300',
    },
    red: {
      card: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
      value: 'text-red-700 dark:text-red-300',
    },
    orange: {
      card: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
      value: 'text-orange-700 dark:text-orange-300',
    },
    teal: {
      card: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700',
      value: 'text-teal-700 dark:text-teal-300',
    },
  } as const;

  const StatCard = ({ icon, label, value, color }: StatCardProps) => (
    <motion.div
      className={`surface rounded-3xl border p-6 ${colorStyles[color as keyof typeof colorStyles].card}`}
      whileHover={{ y: -5 }}
    >
      <div className="text-4xl mb-2">{icon}</div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-3xl font-bold ${colorStyles[color as keyof typeof colorStyles].value}`}>{value}</p>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="mb-2 text-3xl font-black text-slate-900 dark:text-white">📊 Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-300">Platform overview and statistics</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.button
          type="button"
          onClick={() => router.push('/admin/posts?filter=recent')}
          className="text-left"
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <StatCard icon="📝" label="Total Posts" value={stats.totalPosts} color="blue" />
        </motion.button>
        <StatCard icon="🚩" label="Reported" value={stats.reportedPosts} color="red" />
        <StatCard icon="👁️" label="Hidden" value={stats.hiddenPosts} color="orange" />
        <StatCard icon="💬" label="Feedback" value={stats.feedbackCount} color="teal" />
      </div>
    </div>
  );
}
