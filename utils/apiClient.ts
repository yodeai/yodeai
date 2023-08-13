// utils/apiClient.ts

const API_ENDPOINT = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
  : process.env.API_BASE_URL || '' ;

const headers = {
  'Content-Type': 'application/json',
};

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

const fetchData = async (endpoint: string, options: FetchOptions = {}): Promise<any> => {
  try {
    const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
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
