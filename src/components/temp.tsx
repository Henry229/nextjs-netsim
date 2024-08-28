'use client';

import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';

const LoginModal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  // ... (rest of the component logic remains the same)

  return (
    <div className='flex flex-col justify-center items-center min-h-screen bg-background p-4'>
      <div className='w-full max-w-md bg-background p-8 rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold mb-6 text-center'>
          Sign in to your account
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium mb-2'>
              Email address
            </label>
            <Input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium mb-2'
            >
              Password
            </label>
            <Input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? <Spinner className='mr-2' /> : null}
            Sign in
          </Button>
        </form>
        <p className='mt-4 text-center text-sm text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link
            href='/signup'
            className='font-medium text-primary hover:text-primary/80'
          >
            Sign up
          </Link>
        </p>
        <Button
          onClick={() => router.push('/')}
          variant='link'
          className='mt-4 w-full'
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default LoginModal;
