export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.10.3.142:3001/api';

export const config = {
  baseUrl: API_BASE_URL,
};

export async function checkApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
}

export default API_BASE_URL;
