import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import LoginModal from '@/components/loginModal';
// import { useRouter } from 'next/router';

export const metadata: Metadata = {
  title: 'Login - NETSIM',
  description: 'Log in to your NETSIM account',
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  // const handleClose = () => {
  //   router.push('/');
  // };

  // const handleSignUpClick = () => {
  //   router.push('/signup');
  // };

  return <LoginModal />;
}
