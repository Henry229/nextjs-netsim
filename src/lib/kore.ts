'use server';

import { koreService } from '@/services/koreService';
import { revalidatePath } from 'next/cache';

export async function getKoreDevices() {
  const result = await koreService.getCustomerSimCards();
  return result.simCards;
}

export async function changeKoreDeviceStatus(
  subscriptionId: string,
  status: 'Processing'
  // status: 'active' | 'deactivated'
) {
  try {
    const result = await koreService.changeSimStatus(
      'cmp-pp-org-4611',
      subscriptionId,
      status
    );

    if (result.success) {
      revalidatePath('/sim-management/kore-devices');
      return {
        success: true,
        message: result.message,
        requestId: result.requestId,
        updatedDevice: result.updatedDevice,
      };
    } else {
      throw new Error(result.message || 'Failed to initiate status change');
    }
  } catch (error) {
    console.error('Error changing Kore device status:', error);
    return {
      success: false,
      error: 'Failed to change Kore device status',
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function searchKoreDeviceByIccid(iccid: string) {
  try {
    const result = await koreService.searchSimByIccid(iccid);
    return result.simCards;
  } catch (error) {
    console.error('Error searching Kore device:', error);
    return [];
  }
}
