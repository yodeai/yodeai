import { useEffect, useState } from 'react';

interface ApiData {
  // Define the properties of the expected data
  // For example, if the data is { id: number; name: string; }, use:
  // id: number;
  // name: string;
  [key: string]: any; // Use this line if the shape of the data is unknown or can vary
}

function serverAPIFetch(
  endpoint: string,
  method: string = 'GET',
  body: any = null 
) {
  const [data, setData] = useState<ApiData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!baseUrl) {
        setError('Base URL is not defined.');
        return;
      }
      const url = `${baseUrl}${endpoint}`;
      try {
        const options: RequestInit = {
          method,
          headers: { 'Content-Type': 'application/json' },
        };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (error: any) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred.');
        }
      }
    };
    fetchData();
  }, [endpoint, method, body]);

  return { data, error };
}

export default serverAPIFetch;
