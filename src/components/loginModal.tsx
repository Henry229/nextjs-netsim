'use client';
import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toaster';
import { Spinner } from '@/components/ui/spinner';
import { X } from 'lucide-react';
import { SyncLoader } from 'react-spinners';

// import ForgotPasswordModal from './forgotPasswordModal';

// interface LoginModalProps {
//   onClose: () => void;
//   onSignUpClick: () => void;
// }

const LoginModal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState('');
  // const [showForgotPassword, setShowForgotPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      // onClose();
      router.replace('/dashboard');
    }
  }, [status, router]);

  // if (status === 'loading') {
  //   return <div>Loading...</div>;
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // setError('');
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        // setError(res.error);
        toast({
          title: 'Error',
          description: res.error,
          variant: 'destructive',
        });
      } else if (res?.url) {
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
        router.push(res.url);
      }
    } catch (error) {
      console.error('Login error', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      // setError(errorMessage);
    }
  };

  const handleClose = () => {
    router.push('/');
  };

  const handleSignUpClick = () => {
    router.push('/signup');
  };

  if (status === 'loading') {
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
        <SyncLoader color='#FF0000' size={15} />
      </div>
    );
  }
  // const handleSignUpLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  //   e.preventDefault();
  //   onSignUpClick();
  // };

  // const handleForgotPasswordClick = (
  //   e: React.MouseEvent<HTMLAnchorElement>
  // ) => {
  //   e.preventDefault();
  //   setShowForgotPassword(true);
  // };

  // if (showForgotPassword) {
  //   return <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />;
  // }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4'>
      <div
        className='p-6 rounded-lg shadow-xl dark:shadow-dark-xl max-w-md w-full 
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-100
                      border border-gray-200 dark:border-gray-700 relative'
      >
        {/* <div className='bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full relative'> */}
        {/* <div className='flex flex-col justify-center items-center min-h-screen bg-background p-4'> */}
        {/* <div className='w-full max-w-md p-8 bg-background rounded-lg shadow-md'> */}
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-white'
        >
          <X size={24} />
        </button>
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
          {/* <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <input
              id='remember-me'
              name='remember-me'
              type='checkbox'
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className='h-4 w-4 text-primary focus:ring-primary border-input rounded'
            />
            <label htmlFor='remember-me' className='ml-2 block text-sm'>
              Remember me
            </label>
          </div>
          <div className='text-sm'>
            <Link
              href='#'
              onClick={() => {}}
              className='font-medium text-primary hover:text-primary/80'
            >
              Forgot your password?
            </Link>
          </div>
        </div> */}
          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? <Spinner color='#ffffff' size={8} /> : null}
            Sign in
          </Button>
        </form>
        {/* {error && <p className='mt-2 text-sm text-destructive'>{error}</p>} */}
        <p className='mt-4 text-center text-sm text-muted-foreground'>
          Don&apos;t have an account?{' '}
          <Link
            href='/signup'
            onClick={handleSignUpClick}
            className='font-medium text-primary hover:text-primary/80'
          >
            Sign up
          </Link>
        </p>
        <Button onClick={handleClose} variant='link' className='mt-4 w-full'>
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default LoginModal;
