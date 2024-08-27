import React from 'react';
import { ClipLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 50,
  color = '#3498db',
}) => {
  return (
    <div className='flex justify-center items-center h-screen'>
      <ClipLoader color={color} size={size} />
    </div>
  );
};

export default LoadingSpinner;
