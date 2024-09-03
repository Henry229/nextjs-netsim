import { Suspense } from 'react';
import { getKoreDevices } from '@/lib/kore';
import KoreTable from '@/components/KoreTable';
import LoadingSpinner from '@/components/LoadinSpinner';
import { Badge } from '@/components/ui/badge';

export default async function KoreDevicesPage() {
  const initialDevices = await getKoreDevices();
  const processingCount = initialDevices.filter(
    (device) => device.state === 'Processing'
  ).length;

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Kore SIM Cards</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <KoreTable initialDevices={initialDevices} />
      </Suspense>
    </div>
  );
}
