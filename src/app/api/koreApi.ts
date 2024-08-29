// // src/app/api/koreApi.ts
// import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// const ACCOUNT_ID = 'cmp-pp-org-4611';

// export const getAllKoreDevices = async () => {
//   try {
//     const response = await axios.get(
//       `${API_BASE_URL}/api/kore/${ACCOUNT_ID}/subscriptions`
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching Kore devices:', error);
//     throw error;
//   }
// };

// export const changeKoreDeviceStatus = async (
//   subscriptionId: string,
//   status: 'active' | 'deactivated'
// ) => {
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}/api/kore/${ACCOUNT_ID}/change-sim-status`,
//       {
//         subscriptionId,
//         status,
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error changing Kore device status:', error);
//     throw error;
//   }
// };

// export const searchKoreDeviceByIccid = async (iccid: string) => {
//   try {
//     const response = await axios.get(
//       `${API_BASE_URL}/api/kore/${ACCOUNT_ID}/subscriptions`,
//       {
//         params: { iccid },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error searching Kore device:', error);
//     throw error;
//   }
// };
