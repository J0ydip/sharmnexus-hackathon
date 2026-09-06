import { Metadata } from 'next';
import { AdminDashboardClient } from './AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Admin Console — ShramNexus Cooperative Federation',
  description: 'Master control and governance console for ShramNexus Labour Cooperative Federation.',
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
