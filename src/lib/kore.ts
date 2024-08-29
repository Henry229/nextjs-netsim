import { koreService } from '@/services/koreService';
import { revalidatePath } from 'next/cache';

export async function getKoreDevices() {
  const result = await koreService.getCustomerSimCards();
  return result.simCards;
}

export async function changeKoreDeviceStatus(
  subscriptionId: string,
  status: 'active' | 'deactivated'
) {
  'use server';

  try {
    await koreService.changeSimStatus(
      'cmp-pp-org-4611',
      subscriptionId,
      status
    );
    revalidatePath('/kore-devices');
    return { success: true };
  } catch (error) {
    console.error('Error changing Kore device status:', error);
    return { success: false, error: 'Failed to change Kore device status' };
  }
}

export async function searchKoreDeviceByIccid(iccid: string) {
  'use server';

  try {
    const result = await koreService.searchSimByIccid(iccid);
    return result.simCards;
  } catch (error) {
    console.error('Error searching Kore device:', error);
    return [];
  }
}
