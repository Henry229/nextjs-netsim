import React from 'react';
import { SyncLoader } from 'react-spinners';

interface SpinnerProps {
  color?: string;
  size?: number;
}

export function Spinner({ color = '#36D7B7', size = 15 }: SpinnerProps) {
  return (
    <div className='flex justify-center items-center'>
      <SyncLoader color={color} size={size} />
    </div>
  );
}
