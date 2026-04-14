'use client';

import { motion } from 'framer-motion';

export function Skeleton() {
  return (
    <motion.div
      className="surface rounded-3xl border border-sky-200/70 p-5 dark:border-slate-700/75"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <div className="mb-3 space-y-2">
        <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-sky-200/60 pt-3 dark:border-slate-700/80">
        <div className="flex gap-2">
          <div className="h-8 rounded-xl bg-slate-200 px-3 dark:bg-slate-700"></div>
          <div className="h-8 rounded-xl bg-slate-200 px-3 dark:bg-slate-700"></div>
        </div>
        <div className="h-8 rounded-xl bg-slate-200 px-3 dark:bg-slate-700"></div>
      </div>
    </motion.div>
  );
}
