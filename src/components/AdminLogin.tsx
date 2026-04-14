'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('/api/admin/login', { username, password });
      toast.success('Login successful! 🎉');
      router.push('/admin/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (axios.isAxiosError<{ error?: string }>(error)) {
        toast.error(error.response?.data?.error || 'Login failed');
      } else {
        toast.error('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="float-orb -left-10 top-20 h-56 w-56 bg-cyan-400/35 dark:bg-cyan-600/20" />
      <div className="float-orb -right-16 bottom-20 h-64 w-64 bg-teal-300/30 dark:bg-teal-500/20" style={{ animationDelay: '1.4s' }} />

      <motion.div
        className="surface-strong w-full max-w-md rounded-3xl p-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="text-center mb-8">
          <h1 className="mb-2 text-3xl font-black text-slate-900 dark:text-white">🔐 Admin Panel</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Enter your credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full rounded-xl border border-sky-200 bg-white/85 px-4 py-2.5 text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/35 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-sky-200 bg-white/85 px-4 py-2.5 text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/35 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
              disabled={isLoading}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !username || !password}
            className="btn-primary w-full rounded-xl py-3 disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? '🔄 Logging in...' : '✨ Login'}
          </motion.button>
        </form>

        <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sm text-sky-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-sky-200">
          <p>📝 Demo: Use the credentials from .env.local</p>
        </div>
      </motion.div>
    </div>
  );
}
