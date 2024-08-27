import React from 'react';
import { Open_Sans } from 'next/font/google';
import Navbar from '@/components/Navbar';
import ClientLayout from '@/components/ClientLayout';
import { Metadata } from 'next';
import { ThemeProvider } from '@/contexts/theme-provider';
import AuthProvider from '@/contexts/authProvider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { SimProvider } from '@/contexts/simContext';

const openSans = Open_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SIM Management App',
  description: 'Manage your SIM cards efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={openSans.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SimProvider>
              <Navbar />
              <ClientLayout>{children}</ClientLayout>
              <Toaster />
            </SimProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
