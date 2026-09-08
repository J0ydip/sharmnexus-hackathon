import { Metadata } from 'next';
import { getCooperativePortalData } from '@/app/actions/cooperative';
import { CooperativePortalClient } from './CooperativePortalClient';

export const metadata: Metadata = {
  title: 'Cooperative Portal — ShramNexus Federation',
  description: 'Digital Infrastructure for Labour Cooperatives, FairWork Allocation, Tool Bank, and Democratic Member Assembly.',
};

export default async function CooperativePage({
  searchParams,
}: {
  searchParams?: Promise<{ societyId?: string }> | { societyId?: string };
}) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const initialData = await getCooperativePortalData(resolvedParams?.societyId);
  return <CooperativePortalClient initialData={initialData} />;
}
