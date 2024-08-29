// import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// type JasperStatus = 'ACTIVATED' | 'DEACTIVATED';

// export const getAllJasper = async () => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/api/jasper`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching SIMs:', error);
//     throw error;
//   }
// };

// export const changeJasperStatus = async (
//   iccid: string,
//   newStatus: JasperStatus
// ) => {
//   try {
//     const response = await axios.put(
//       `${API_BASE_URL}/api/jasper/devices/${iccid}`,
//       { status: newStatus }
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error changing SIM status:', error);
//     throw error;
//   }
// };

// export const searchJasperDeviceByIccid = async (iccid: string) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/api/jasper`, {
//       params: { iccid },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error searching Jasper device:', error);
//     throw error;
//   }
// };

// export const getJasperStatusCounts = async () => {
//   try {
//     const response = await axios.get(
//       `${API_BASE_URL}/api/jasper/status-counts`
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching Jasper status counts:', error);
//     throw error;
//   }
// };
