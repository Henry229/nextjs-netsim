'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { BiEdit } from 'react-icons/bi';
import { useToast } from '@/components/ui/use-toast';
import LoginModal from './loginModal';
import { Spinner } from './ui/spinner';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSignOut = async () => {
    const result = await signOut({ redirect: false, callbackUrl: '/' });
    toast({
      title: 'Success',
      description: 'Logged out successfully',
    });
    router.push(result.url);
  };

  const isAdmin = session?.user?.role === 'admin';

  const handleEditClick = () => {
    router.push('/admin');
  };

  if (status === 'loading') {
    return (
      <div className='flex justify-center items-center h-screen'>
        <Spinner />
      </div>
    );
  }

  return (
    <nav className='flex items-center justify-between p-4 bg-background text-foreground shadow-md'>
      <div className='flex items-center space-x-2'>
        <Link href='/' className='flex items-center space-x-2'>
          <Image
            src='/NETSIM.svg'
            alt='NETSIM Logo'
            width={30}
            height={30}
            priority
          />
          <span className='text-xl font-bold'>NETSIM</span>
        </Link>
      </div>
      <div className='flex items-center space-x-2'>
        {session ? (
          <div className='flex items-center space-x-4'>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='p-2'>
                    <BiEdit className='h-5 w-5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => router.push('/admin/permissions')}
                  >
                    Permission
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/admin/password')}
                  >
                    Password
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              // <Link href='/users'>
              //   <Button variant='ghost' className='p-2'>
              //     <BiEdit className='h-5 w-5' />
              //   </Button>
              // </Link>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-8 w-8 rounded-full'
                >
                  <Avatar>
                    <AvatarImage
                      src={session.user?.image || ''}
                      alt={session.user?.name || ''}
                    />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>
                  <Link href='/profile'>Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <>
            <Button variant='outline' onClick={() => setIsLoginModalOpen(true)}>
              Login
            </Button>
            <Button onClick={() => router.push('/signup')}>Sign Up</Button>
          </>
        )}
        <ThemeToggle />
      </div>
      {isLoginModalOpen && (
        <LoginModal />
        // <LoginModal
        //   onClose={() => setIsLoginModalOpen(false)}
        //   onSignUpClick={() => {
        //     setIsLoginModalOpen(false);
        //     router.push('/signup');
        //   }}
        // />
      )}
    </nav>
  );
}
