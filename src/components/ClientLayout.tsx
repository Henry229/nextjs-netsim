'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isFixed, setIsFixed] = useState(true);

  return (
    <div className='flex flex-1 pt-16'>
      <Sidebar isFixed={isFixed} setIsFixed={setIsFixed} />
      <main
        className={`transition-all duration-300 ${isFixed ? 'ml-64' : 'ml-0'}`}
      >
        {children}
      </main>
    </div>
  );
}
