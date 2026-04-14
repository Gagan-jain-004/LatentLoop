import type { Metadata } from 'next';
import { Sora, IBM_Plex_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
});

const ibmMono = IBM_Plex_Mono({
  variable: '--font-ibm-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RTU Got Latent',
  description:
    'Share your thoughts anonymously. Post without login, upvote/downvote, and see trending posts. All posts auto-delete after 30 days.',
  keywords: ['anonymous', 'social', 'posting', 'reddit', 'twitter', 'trending'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${ibmMono.variable} min-h-full flex flex-col font-[var(--font-sora)] text-slate-900 dark:text-slate-100`}
      >
        {children}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#082032',
              color: '#fff',
              borderRadius: '0.875rem',
              border: '1px solid rgba(125, 211, 252, 0.32)',
            },
            success: {
              style: {
                background: '#0f766e',
              },
            },
            error: {
              style: {
                background: '#be123c',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
