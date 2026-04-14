'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <motion.div
        className={`surface flex items-center gap-3 rounded-2xl px-4 py-3 transition-all ${
          isFocused
            ? 'border-cyan-400/80 ring-2 ring-cyan-300/35 dark:ring-cyan-700/25'
            : 'border-sky-200/70 dark:border-slate-700/70'
        }`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <svg className="h-5 w-5 text-cyan-700/70 dark:text-cyan-300/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search confessions, rants, hot takes..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500 dark:text-slate-100 dark:placeholder:text-slate-400"
        />
      </motion.div>
    </form>
  );
}
