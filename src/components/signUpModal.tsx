'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { signUp } from '@/app/api/authApi';

const SignUpModal: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(name, email, password);
      toast({
        title: 'Success',
        description: 'Account created successfully. Please log in.',
      });
      router.push('/login');
    } catch (error) {
      console.error('Signup error', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 p-4'>
      <div
        className='p-6 rounded-lg shadow-xl dark:shadow-dark-xl max-w-md w-full 
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-100
                      border border-gray-200 dark:border-gray-700 relative'
      >
        {/* <div className='w-full max-w-md bg-background p-8 rounded-lg shadow-md'> */}
        <h2 className='text-2xl font-bold mb-6 text-center'>
          Create a new account
        </h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium mb-2'>
              Name
            </label>
            <Input
              type='text'
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
            {loading ? <Spinner /> : null}
            Sign up
          </Button>
        </form>
        <p className='mt-4 text-center text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='font-medium text-primary hover:text-primary/80'
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpModal;
