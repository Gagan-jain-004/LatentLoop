'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface FilterTabsProps {
  onFilterChange: (filter: string) => void;
  activeFilter?: string;
}

const filters = [
  { id: 'latest', label: 'All Posts', icon: '🕐' },
  { id: 'trending', label: 'Trending', icon: '🔥' },
];

export default function FilterTabs({ onFilterChange, activeFilter: activeFilterProp }: FilterTabsProps) {
  const [internalActiveFilter, setInternalActiveFilter] = useState('latest');
  const activeFilter = activeFilterProp ?? internalActiveFilter;

  const handleFilterChange = (filter: string) => {
    if (activeFilterProp === undefined) {
      setInternalActiveFilter(filter);
    }
    onFilterChange(filter);
  };

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <motion.button
          key={filter.id}
          onClick={() => handleFilterChange(filter.id)}
          className={`whitespace-nowrap rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all ${
            activeFilter === filter.id
              ? 'border-cyan-500 bg-linear-to-r from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-500/30'
              : 'surface border-sky-200/65 text-slate-700 hover:border-cyan-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-800 dark:hover:text-slate-100'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="mr-2 rounded-full bg-white/30 px-1.5 py-0.5 text-[11px]">{filter.icon}</span>
          {filter.label}
        </motion.button>
      ))}
    </div>
  );
}
