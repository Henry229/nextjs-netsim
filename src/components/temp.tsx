import axios from 'axios';
import prisma from '@/lib/prisma';

// ... (이전 코드는 그대로 유지)

export const koreService = {
  // ... (다른 함수들은 그대로 유지)

  getProcessingRequests: async () => {
    try {
      // 먼저 로컬 데이터베이스에서 'Processing' 상태의 디바이스를 가져옵니다.
      const processingDevices = await prisma.netKoreDevices.findMany({
        where: { state: 'Processing' },
      });

      const updatePromises = processingDevices.map(async (device) => {
        // Kore API를 호출하여 실제 상태를 확인합니다.
        const response = await koreApi.get(
          `/v1/accounts/${ACCOUNT_ID}/provisioning-requests/${device.provisioning_request_id}`
        );
        const status = response.data.status;

        if (status === 'completed') {
          // 완료된 경우, 원래 의도했던 상태로 업데이트합니다.
          const intendedState = response.data.intendedState; // API 응답에서 의도한 상태를 가져옵니다.
          await prisma.netKoreDevices.update({
            where: { id: device.id },
            data: { state: intendedState },
          });
          return { ...device, state: intendedState };
        } else {
          // 아직 처리 중인 경우, 상태를 그대로 유지합니다.
          return device;
        }
      });

      const updatedDevices = await Promise.all(updatePromises);
      return updatedDevices;
    } catch (error) {
      console.error('Error fetching and updating processing requests:', error);
      throw error;
    }
  },

  changeSimStatus: async (
    accountId: string,
    subscriptionId: string,
    status: string,
    imei: string | null = null
  ) => {
    try {
      console.log(`Attempting to change status to: ${status}`);
      let endpoint: string;
      let requestBody: any;

      switch (status.toLowerCase()) {
        case 'activated':
          endpoint = `/v1/accounts/${accountId}/provisioning-requests/activate`;
          requestBody = {
            activate: {
              'activation-state': 'active',
              subscriptions: [
                {
                  'subscription-id': subscriptionId,
                },
              ],
            },
          };
          break;
        case 'deactivated':
          endpoint = `/v1/accounts/${accountId}/provisioning-requests/deactivate`;
          requestBody = {
            deactivate: {
              subscriptions: [
                {
                  'subscription-id': subscriptionId,
                },
              ],
            },
          };
          break;
        // ... (다른 case들은 그대로 유지)
        default:
          console.log('>>>> Invalid status:', status);
          throw new Error('Invalid status. Must be Activated or Deactivated.');
      }

      // ... (나머지 코드는 그대로 유지)

      const response = await koreApi.post(endpoint, requestBody);
      console.log('Response:', JSON.stringify(response.data, null, 2));

      if (response.data.status === 'success') {
        const provisioningRequestId =
          response.data.data['provisioning-request-id'];
        const updatedDevice = await prisma.netKoreDevices.update({
          where: { subscription_id: subscriptionId },
          data: {
            state: 'Processing',
            provisioning_request_id: provisioningRequestId,
            intended_state:
              status.toLowerCase() === 'activated' ? 'Active' : 'Deactivated',
          },
        });

        return {
          success: true,
          message: `SIM status change to ${status} is processing`,
          requestId: provisioningRequestId,
          updatedDevice: updatedDevice,
        };
      } else {
        throw new Error(response.data.message || 'Failed to change SIM status');
      }
    } catch (error: any) {
      console.error('Error in changeSimStatus:', error);
      throw error;
    }
  },

  // ... (다른 함수들은 그대로 유지)
};
