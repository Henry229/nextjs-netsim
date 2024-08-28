import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const signUp = async (name: string, email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || 'An error occurred during signup'
      );
    }
    throw new Error('An unexpected error occurred');
  }
};
