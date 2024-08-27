import NextAuth from 'next-auth';
import { authOptions } from '@/auth';

console.log('NextAuth route is being executed');

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

console.log('NextAuth route has been set up');
