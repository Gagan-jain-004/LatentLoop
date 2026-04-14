'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface FooterProps {
  onFeedbackClick: () => void;
}

export default function Footer({ onFeedbackClick }: FooterProps) {
  return (
    <motion.footer
      className="mt-12 border-t border-sky-200/45 bg-transparent py-10 dark:border-slate-700/60"
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-8 py-2 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-black text-slate-900 dark:text-white">RTU Got Latent</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Anonymous platform for sharing thoughts without fear or judgment.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">Features</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>✨ Anonymous Posting</li>
              <li>🔥 Trending Posts</li>
              <li>🚩 Report System</li>
              <li>⏳ Auto-Delete (30 days)</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-slate-700 dark:text-slate-200">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/admin" className="font-semibold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200">
                  🔐 Admin Panel
                </Link>
              </li>
              <li>
                <motion.button
                  onClick={onFeedbackClick}
                  className="font-semibold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300 dark:hover:text-cyan-200"
                  whileHover={{ scale: 1.05 }}
                >
                  💬 Send Feedback
                </motion.button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sky-200/45 pt-6 text-center text-sm text-slate-600 dark:border-slate-700/70 dark:text-slate-400">
          <p>© 2026 RTU Got Latent. All posts auto-delete after 30 days.</p>
        </div>
      </div>
    </motion.footer>
  );
}
