'use client';

import { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header, Feed, FeedbackModal, Footer } from '@/components';

type CreatedPost = {
  _id: string;
  content: string;
  imageUrl?: string;
  imagePublicId?: string;
  poll?: {
    question: string;
    options: {
      id: string;
      text: string;
      votes: number;
    }[];
    totalVotes: number;
  };
  upvotes: number;
  downvotes: number;
  reports: number;
  hidden: boolean;
  score: number;
  createdAt: string;
};

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [optimisticPost, setOptimisticPost] = useState<CreatedPost | null>(null);

  const currentFilter = useMemo(() => {
    const filterFromUrl = searchParams.get('filter');
    if (filterFromUrl === 'trending' || filterFromUrl === 'top') {
      return filterFromUrl;
    }

    return 'latest';
  }, [searchParams]);

  useEffect(() => {
    const handlePageShow = () => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (navEntry?.type === 'back_forward') {
        router.replace('/', { scroll: false });
        setOptimisticPost(null);
        setRefreshTrigger((prev) => prev + 1);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [router]);

  const handlePostCreated = useCallback((post: CreatedPost) => {
    router.replace('/', { scroll: false });
    setOptimisticPost(post);
    setRefreshTrigger((prev) => prev + 1);
    requestAnimationFrame(() => {
      document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [router]);

  const handleFilterChange = useCallback((filter: string) => {
    const targetUrl = filter === 'latest' ? '/' : `/?filter=${filter}`;
    router.replace(targetUrl, { scroll: false });
  }, [router]);

  return (
    <main className="app-shell min-h-screen">
      <Header onFilterChange={handleFilterChange} activeFilter={currentFilter} onPostCreated={handlePostCreated} />

      <section id="feed" className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:pt-8">
        <Feed filter={currentFilter} refreshTrigger={refreshTrigger} optimisticPost={optimisticPost} />
      </section>

      <Footer onFeedbackClick={() => setIsFeedbackOpen(true)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="app-shell min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}
