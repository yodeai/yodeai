// utils/apiClient.ts

const API_BASE_URL = process.env.API_BASE_URL || '';  // Fallback to an empty string if not set

const headers = {
  'Content-Type': 'application/json',
};

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

const fetchData = async (endpoint: string, options: FetchOptions = {}): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occurred');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default fetchData;
