import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const iccid = searchParams.get('iccid');

  try {
    if (iccid) {
      const device = await prisma.netJasperDevices.findUnique({
        where: { iccid },
      });
      return NextResponse.json({ simCards: device ? [device] : [] });
    } else {
      const devices = await prisma.netJasperDevices.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ simCards: devices });
    }
  } catch (error) {
    console.error('Error fetching Jasper devices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const { iccid } = req.params;
  const { status } = await req.json();

  try {
    const updatedDevice = await prisma.netJasperDevices.update({
      where: { iccid },
      data: { status },
    });
    return NextResponse.json(updatedDevice);
  } catch (error) {
    console.error('Error updating Jasper device status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
