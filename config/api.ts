/**
 * API Configuration
 * Centralized API base URL configuration
 * 
 * To change the API server:
 * 1. Find your computer's IP address (ipconfig on Windows, ifconfig on Mac/Linux)
 * 2. Update the IP_ADDRESS constant below
 * 3. Make sure your backend server is running on port 3001
 */

// Your local IP address - update this when switching networks
const IP_ADDRESS = '192.168.103.209';

// Backend server port
const PORT = '3001';

// API base URL - DO NOT modify this directly, change IP_ADDRESS instead
export const API_BASE_URL = `http://${IP_ADDRESS}:${PORT}/api`;

// Alternative: Use environment variables (recommended for production)
// export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${IP_ADDRESS}:${PORT}/api`;

// Export individual parts if needed
export const config = {
  ip: IP_ADDRESS,
  port: PORT,
  baseUrl: API_BASE_URL,
};

// Helper function to check if API is reachable
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
