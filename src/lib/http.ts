// Use the correct API base URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:8000');

interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
}

class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_BASE_URL, timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Retry on 502, 503, 504 errors
        if ([502, 503, 504].includes(response.status)) {
          console.warn(`Retrying request to ${endpoint} due to ${response.status}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.request<T>(endpoint, options);
        }

        const errorText = await response.text();
        return {
          data: null,
          error: `HTTP ${response.status}: ${errorText || response.statusText}`
        };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { data: null, error: 'Request timeout' };
        }
        return { data: null, error: error.message };
      }
      return { data: null, error: 'Unknown error occurred' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
export default httpClient;
