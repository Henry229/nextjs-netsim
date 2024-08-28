// src/app/api/kore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const iccid = searchParams.get('iccid');

  try {
    if (iccid) {
      const device = await prisma.netKoreDevices.findUnique({
        where: { iccid },
      });
      return NextResponse.json({ simCards: device ? [device] : [] });
    } else {
      const devices = await prisma.netKoreDevices.findMany({
        orderBy: { created_at: 'desc' },
      });
      return NextResponse.json({ simCards: devices });
    }
  } catch (error) {
    console.error('Error fetching Kore devices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subscription_id = searchParams.get('subscription_id');
  const { state } = await req.json();

  if (!subscription_id) {
    return NextResponse.json(
      { error: 'Subscription ID is required' },
      { status: 400 }
    );
  }

  try {
    const updatedDevice = await prisma.netKoreDevices.update({
      where: { subscription_id },
      data: { state },
    });
    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error('Error updating Kore device status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
