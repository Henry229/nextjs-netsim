'use server';

import { koreService } from '@/services/koreService';
import { revalidatePath } from 'next/cache';

export async function getKoreDevices() {
  const result = await koreService.getCustomerSimCards();
  return result.simCards;
}

export async function changeKoreDeviceStatus(
  subscriptionId: string,
  status: 'Activated' | 'Deactivated' | 'Processing'
  // status: 'active' | 'deactivated'
) {
  console.log(`Changing status for ${subscriptionId} to ${status}`);
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

export async function getProcessingStatus() {
  try {
    const result = await koreService.getProcessingStatus();
    return result;
  } catch (error) {
    console.error('Error fetching processing requests:', error);
    throw error;
  }
}

// export async function updateProcessingStatus(provisioningRequestIds: string[]) {
//   try {
//     await koreService.updateProcessingStatus(provisioningRequestIds);
//     revalidatePath('/sim-management/kore-devices/processing');
//     return { success: true };
//   } catch (error) {
//     console.error('Error updating processing status:', error);
//     throw error;
//   }
// }

export async function findRequestStatusByProvisioningRequestId(
  accountId: string,
  provisioningRequestId: string
) {
  try {
    const result = await koreService.findRequestStatusByProvisioningRequestId(
      accountId,
      provisioningRequestId
    );
    revalidatePath('/sim-management/kore-devices/processing');
    return {
      success: true,
      message: `SIM 상태가 ${provisioningRequestId}로 변경되어 처리 중입니다`,
      status: result.status,
      requestType: result.requestType,
    };
  } catch (error) {
    console.error('Error finding request status:', error);
    return {
      success: false,
      error: 'Failed to find request status',
      message:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

export async function updateKoreDeviceStatus(
  iccid: string,
  subscriptionId: string,
  provisioningRequestId: string,
  status: string
) {
  try {
    await koreService.updateProcessingStatus(
      iccid,
      subscriptionId,
      provisioningRequestId,
      status
    );
    revalidatePath('/sim-management/kore-devices/processing');
    return { success: true };
  } catch (error) {
    console.error('Error updating Kore device status:', error);
    throw error;
  }
}
