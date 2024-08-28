import React from 'react';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import SignUpModal from '@/components/signUpModal';

export const metadata: Metadata = {
  title: 'Sign Up - NETSIM',
  description: 'Create a new account for NETSIM',
};

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return <SignUpModal />;
}
