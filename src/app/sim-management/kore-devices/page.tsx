// src/app/sim-management/kore-devices/page.tsx
import React from 'react';
import KoreTable from '@/components/KoreTable';

export default function KoreDevicesPage() {
  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Kore SIM Cards</h1>
      <KoreTable />
    </div>
  );
}
