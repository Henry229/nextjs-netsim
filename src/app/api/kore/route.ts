// import { NextRequest, NextResponse } from 'next/server';
// import { koreService } from '@/services/koreService';

// export async function GET(req: NextRequest) {
//   const searchParams = req.nextUrl.searchParams;
//   const iccid = searchParams.get('iccid');

//   try {
//     if (iccid) {
//       const result = await koreService.searchSimByIccid(iccid);
//       return NextResponse.json(result);
//     } else {
//       const result = await koreService.getCustomerSimCards();
//       return NextResponse.json(result);
//     }
//   } catch (error) {
//     console.error('Error in Kore API route:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { accountId, subscriptionId, status, imei } = await req.json();
//     const result = await koreService.changeSimStatus(
//       accountId,
//       subscriptionId,
//       status,
//       imei
//     );
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('Error in Kore API route:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req: NextRequest) {
//   try {
//     const result = await koreService.getStatusCounts();
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('Error in Kore API route:', error);
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }
