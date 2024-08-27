'use client';

import React, { useEffect, useState } from 'react';
import { getJasperStatusCounts } from '@/app/api/jasperApi';
import { getKoreStatusCounts } from '@/app/api/koreApi';
import StatusCards from './statusCards';

interface StatusCounts {
  [key: string]: number;
}

const Dashboard: React.FC = () => {
  const [jasperCounts, setJasperCounts] = useState<StatusCounts>({});
  const [koreCounts, setKoreCounts] = useState<StatusCounts>({});

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const jasperData = await getJasperStatusCounts();
        setJasperCounts(jasperData);
        const koreData = await getKoreStatusCounts();
        setKoreCounts(koreData);
      } catch (error) {
        console.error('Error fetching status counts:', error);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Dashboard</h1>
      <StatusCards counts={jasperCounts} title='Jasper SIM Status' />
      <StatusCards counts={koreCounts} title='KORE SIM Status' />
    </div>
  );
};

export default Dashboard;
