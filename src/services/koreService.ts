import axios from 'axios';
import prisma from '@/lib/prisma';

const AUTH_TOKEN_URL = process.env.KORE_AUTH_TOKEN_URL;
const API_BASE_URL = process.env.KORE_API_BASE_URL;
const API_GATEWAY_KEY = process.env.KORE_API_GATEWAY_KEY;
const CLIENT_ID = process.env.KORE_CLIENT_ID;
const CLIENT_SECRET = process.env.KORE_CLIENT_SECRET;
const ACCOUNT_ID = 'cmp-pp-org-4611';

async function getAuthToken() {
  const headers = {
    Authorization: `bearer ${API_GATEWAY_KEY}`,
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  const data = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
  });

  try {
    const response = await axios.post(AUTH_TOKEN_URL!, data, { headers });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

const koreApi = axios.create({
  baseURL: API_BASE_URL,
});

koreApi.interceptors.request.use(async function (config) {
  const token = await getAuthToken();
  config.headers['Authorization'] = `bearer ${token}`;
  config.headers['x-api-key'] = API_GATEWAY_KEY;
  return config;
});

export const koreService = {
  getCustomerSimCards: async () => {
    try {
      const koreSims = await prisma.netKoreDevices.findMany({
        orderBy: { created_at: 'desc' },
      });

      return {
        simCards: koreSims,
      };
    } catch (error) {
      console.error('Error fetching SIM cards from database:', error);
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
        case 'suspended':
          endpoint = `/v1/accounts/${accountId}/provisioning-requests/suspend`;
          requestBody = {
            suspend: {
              subscriptions: [{ subscription_id: subscriptionId }],
            },
          };
          break;
        case 'processing':
          console.log('Processing status detected, returning immediately');
          return {
            success: true,
            message: `SIM ${subscriptionId} status change is processing`,
            requestId: null,
            updatedDevice: null,
          };
        default:
          console.log('>>>> Invalid status:', status);
          throw new Error('Invalid status. Must be Activated or Deactivated.');
      }

      if (imei) {
        requestBody[
          status === 'Activated' ? 'Activated' : status
        ].subscriptions[0].imei = imei;
      }
      console.log('Sending request to:', endpoint);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

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
          },
        });

        return {
          success: true,
          message: `SIM status changed to ${subscriptionId} is processing`,
          requestId: provisioningRequestId,
          updatedDevice: updatedDevice,
        };
      } else {
        throw new Error(response.data.message || 'Failed to change SIM status');
      }
    } catch (error: any) {
      console.error(
        'Error in changeSimStatus:',
        error.response
          ? JSON.stringify(error.response.data, null, 2)
          : error.message
      );
      throw error;
    }
  },

  searchSimByIccid: async (iccid: string) => {
    try {
      const sim = await prisma.netKoreDevices.findUnique({
        where: { iccid },
      });

      return sim ? { simCards: [sim] } : { simCards: [] };
    } catch (error) {
      console.error('Error searching SIM by ICCID:', error);
      throw error;
    }
  },

  getStatusCounts: async () => {
    try {
      const counts = await prisma.netKoreDevices.groupBy({
        by: ['state'],
        _count: {
          state: true,
        },
        orderBy: [
          {
            _count: {
              state: 'desc',
            },
          },
          {
            state: 'asc',
          },
        ],
      });

      const result = counts.reduce((acc: Record<string, number>, count) => {
        acc[count.state] = count._count.state;
        return acc;
      }, {});

      return result;
    } catch (error) {
      console.error('Error fetching KORE status counts:', error);
      throw error;
    }
  },
  getProcessingStatus: async () => {
    try {
      const processingDevices = await prisma.netKoreDevices.findMany({
        where: { state: 'Processing' },
      });
      return processingDevices;
    } catch (error) {
      console.error('Error fetching processing status in Kore:', error);
      throw error;
    }
  },

  findRequestStatusByProvisioningRequestId: async (
    ACCOUNT_ID: string,
    provisioningRequestId: string
  ) => {},

  updateProcessingStatus: async (provisioningRequestIds: string[]) => {
    try {
      const updatePromises = provisioningRequestIds.map(async (id) => {
        const response = await koreApi.get(
          `/v1/accounts/${ACCOUNT_ID}/provisioning-requests/${id}`
        );
        const status = response.data.data.status;

        if (status === 'completed') {
          const subscriptions = response.data.data.subscriptions;
          for (const sub of subscriptions) {
            await prisma.netKoreDevices.updateMany({
              where: { subscription_id: sub['subscription-id'] },
              data: { state: sub['completion-status'] },
            });
          }
        }

        return { id, status };
      });

      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      console.error('Error updating processing status:', error);
      throw error;
    }
  },
};
