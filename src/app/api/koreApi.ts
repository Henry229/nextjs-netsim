// src/app/api/koreApi.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getAllKoreDevices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/kore`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Kore devices:', error);
    throw error;
  }
};

export const changeKoreDeviceStatus = async (
  subscriptionId: string,
  state: string
) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/kore?subscription_id=${subscriptionId}`,
      { state }
    );
    return response.data;
  } catch (error) {
    console.error('Error changing Kore device status:', error);
    throw error;
  }
};

export const searchKoreDeviceByIccid = async (iccid: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/kore`, {
      params: { iccid },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching Kore device:', error);
    throw error;
  }
};
