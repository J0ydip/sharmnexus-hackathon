import { Metadata } from 'next';
import { WorkerDashboardClient } from './WorkerDashboardClient';

export const metadata: Metadata = {
  title: 'Worker Member Dashboard — ShramNexus Cooperative Federation',
  description: 'Cooperative worker-member operations, job dispatch, and earnings passbook.',
};

export default function WorkerDashboardPage() {
  return <WorkerDashboardClient />;
}
