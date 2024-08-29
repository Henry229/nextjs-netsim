'use server';

import { jasperService } from '@/services/jasperService';
import { revalidatePath } from 'next/cache';

export async function getJasperDevices() {
  const result = await jasperService.getCustomerSimCards();
  return result.simCards;
}

export async function changeJasperDeviceStatus(
  iccid: string,
  status: 'ACTIVATED' | 'DEACTIVATED'
) {
  try {
    await jasperService.changeSimStatus(iccid, status);
    revalidatePath('/jasper-devices');
    return { success: true };
  } catch (error) {
    console.error('Error changing Jasper device status:', error);
    return { success: false, error: 'Failed to change Jasper device status' };
  }
}

export async function searchJasperDeviceByIccid(iccid: string) {
  try {
    const result = await jasperService.searchSimByIccid(iccid);
    return result.simCards;
  } catch (error) {
    console.error('Error searching Jasper device:', error);
    return [];
  }
}
