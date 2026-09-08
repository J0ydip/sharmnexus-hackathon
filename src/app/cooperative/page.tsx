import { Metadata } from 'next';
import { getCooperativePortalData } from '@/app/actions/cooperative';
import { CooperativePortalClient } from './CooperativePortalClient';

export const metadata: Metadata = {
  title: 'Cooperative Portal — ShramNexus Federation',
  description: 'Digital Infrastructure for Labour Cooperatives, FairWork Allocation, Tool Bank, and Democratic Member Assembly.',
};

export default async function CooperativePage() {
  const initialData = await getCooperativePortalData();
  return <CooperativePortalClient initialData={initialData} />;
}
