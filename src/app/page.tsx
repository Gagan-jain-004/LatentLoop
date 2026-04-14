'use client';

import { useState, useCallback } from 'react';
import { Header, Feed, FeedbackModal, Footer } from '@/components';

type CreatedPost = {
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
};

export default function Home() {
  const [currentFilter, setCurrentFilter] = useState('latest');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [optimisticPost, setOptimisticPost] = useState<CreatedPost | null>(null);

  const handlePostCreated = useCallback((post: CreatedPost) => {
    setCurrentFilter('latest');
    setOptimisticPost(post);
    setRefreshTrigger((prev) => prev + 1);
    requestAnimationFrame(() => {
      document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  return (
    <main className="app-shell min-h-screen">
      <Header onFilterChange={setCurrentFilter} onPostCreated={handlePostCreated} />

      <section id="feed" className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:pt-8">
        <Feed filter={currentFilter} refreshTrigger={refreshTrigger} optimisticPost={optimisticPost} />
      </section>

      <Footer onFeedbackClick={() => setIsFeedbackOpen(true)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </main>
  );
}
