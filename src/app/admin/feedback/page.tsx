import { AdminFeedbackManager } from '@/components';
import AdminNav from '@/components/AdminNav';
import { redirect } from 'next/navigation';
import { verifyAdminFromServerCookies } from '@/lib/admin-auth';

export default async function AdminFeedbackPage() {
  const admin = await verifyAdminFromServerCookies();
  if (!admin) {
    redirect('/admin');
  }

  return (
    <div className="app-shell min-h-screen">
      <AdminNav />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <AdminFeedbackManager />
      </div>
    </div>
  );
}
