import React from 'react';
import { Metadata } from 'next';
import ProcessingTable from '@/components/ProcessingTable';

export const metadata: Metadata = {
  title: 'Kore Devices Processing - NETSIM',
  description: 'Process and update Kore devices status',
};

export default function ProcessingPage() {
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Kore Devices Processing</h1>
      <ProcessingTable />
    </div>
  );
}
