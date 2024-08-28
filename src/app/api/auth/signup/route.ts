import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.simUser.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get the default role (assuming 'readonly' is the default role)
    const defaultRole = await prisma.simRole.findFirst({
      where: { name: 'readonly' },
    });
    if (!defaultRole) {
      return NextResponse.json({ error: 'Default role not found' }, { status: 500 });
    }

    // Create the user
    const user = await prisma.simUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: defaultRole.id,
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword,
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}