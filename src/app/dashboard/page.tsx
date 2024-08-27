import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/dashboard';

export const metadata: Metadata = {
  title: 'NETSIM Dashboard',
  description: 'Manage your SIM cards efficiently with NETSIM',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <main className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>
      <Dashboard />
    </main>
  );
}
