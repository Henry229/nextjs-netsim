import { Suspense } from 'react';
import { getJasperDevices } from '@/lib/jasper';
import JasperTable from '@/components/JasperTable';
import LoadingSpinner from '@/components/LoadinSpinner';

export default async function JasperDevicesPage() {
  const initialDevices = await getJasperDevices();

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Jasper SIM Cards</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <JasperTable initialDevices={initialDevices} />
      </Suspense>
    </div>
  );
}
