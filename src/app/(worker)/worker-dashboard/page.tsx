import { Metadata } from 'next';
import { Suspense } from 'react';
import { WorkerDashboardClient } from './WorkerDashboardClient';

export const metadata: Metadata = {
  title: 'Worker Member Dashboard — ShramNexus Cooperative Federation',
  description: 'Cooperative worker-member operations, job dispatch, and earnings passbook.',
};

export default function WorkerDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf7ef] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#d96f4d] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WorkerDashboardClient />
    </Suspense>
  );
}
