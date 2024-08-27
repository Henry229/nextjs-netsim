import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.simUser.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role.name },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Signed in successfully',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
