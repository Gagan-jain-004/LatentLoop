'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FilterTabs from './FilterTabs';
import PostInput from './PostInput';

interface HeaderProps {
  onFilterChange: (filter: string) => void;
  onPostCreated: (post: {
    _id: string;
    content: string;
    imageUrl?: string;
    imagePublicId?: string;
    upvotes: number;
    downvotes: number;
    reports: number;
    hidden: boolean;
    score: number;
    createdAt: string;
  }) => void;
}

export default function Header({ onFilterChange, onPostCreated }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else if (storedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
        setIsDarkMode(prefersDark);
      }
    };

    syncTheme();
  }, []);

  const handleThemeToggle = () => {
    const nextIsDark = !isDarkMode;
    setIsDarkMode(nextIsDark);
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
  };

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-sky-200/50 bg-transparent transition-all duration-300 dark:border-slate-700/70"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-4 md:py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <motion.div
            className="group flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="grid h-11 w-11 place-content-center rounded-2xl border border-sky-200 bg-linear-to-br from-cyan-500 to-teal-500 text-lg font-black text-white shadow-lg shadow-cyan-500/35 dark:border-sky-700/50">
              R
            </div>

            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">RTU Got Latent</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Campus Pulseboard
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleThemeToggle}
              className="rounded-2xl border border-sky-200 bg-white/75 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle theme"
            >
              {isDarkMode ? 'Light' : 'Dark'}
            </motion.button>
          </div>
        </div>

        <PostInput onPostCreated={onPostCreated} compact />
        <FilterTabs onFilterChange={onFilterChange} />
      </div>
    </motion.header>
  );
}
