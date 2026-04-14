import { AdminLogin } from '@/components';
import { redirect } from 'next/navigation';
import { verifyAdminFromServerCookies } from '@/lib/admin-auth';

export default async function AdminPage() {
  const admin = await verifyAdminFromServerCookies();
  if (admin) {
    redirect('/admin/dashboard');
  }

  return <AdminLogin />;
}
