'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await axios.post('/api/admin/logout');
      toast.success('Logged out');
      router.push('/admin');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { href: '/admin/dashboard', label: '📊 Dashboard', icon: '📊' },
    { href: '/admin/posts', label: '🚩 Posts', icon: '🚩' },
    { href: '/admin/feedback', label: '💬 Feedback', icon: '💬' },
  ];

  return (
    <motion.header className="sticky top-0 z-40 border-b border-sky-200/60 bg-white/70 shadow-lg backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/72">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-cyan-700 dark:text-cyan-300">
            RTU Admin
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl border px-4 py-2 font-semibold transition-all ${
                    pathname === item.href
                      ? 'border-cyan-500 bg-linear-to-r from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'border-transparent text-slate-700 hover:border-sky-200 hover:bg-sky-50 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <motion.button
              onClick={handleLogout}
              className="rounded-2xl bg-rose-600 px-4 py-2 font-semibold text-white transition-all hover:bg-rose-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚪 Logout
            </motion.button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-2 mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 rounded-xl border px-3 py-2 text-center text-sm font-semibold transition-all ${
                pathname === item.href
                  ? 'border-cyan-500 bg-linear-to-r from-cyan-600 to-teal-500 text-white'
                  : 'border-sky-200 bg-white/70 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300'
              }`}
            >
              {item.icon}
            </Link>
          ))}
        </div>
      </div>
    </motion.header>
  );
}
