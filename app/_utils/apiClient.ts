// utils/apiClient.ts


const API_ENDPOINT = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api`
    : process.env.NEXT_PUBLIC_API_BASE_URL || '';

const headers = {
    'Content-Type': 'application/json',
};

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

const fetchData = async (endpoint: string, options: FetchOptions = {}): Promise<any> => {

      const adjustedEndpoint = endpoint;
    try {
        const response = await fetch(`${API_ENDPOINT}${adjustedEndpoint}`, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        }); 
        console.log("RESPONSE: ", response);

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'An error occurred');
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export default fetchData;
