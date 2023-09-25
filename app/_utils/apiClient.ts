// utils/apiClient.js

async function apiClient(
    endpoint: string,
    method: string = 'GET',
    body: any = null 
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!baseUrl) throw new Error('Base URL is not defined.');
    const url = `${baseUrl}${endpoint}`;
  
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
    return result;
  }
  
  export default apiClient;
  