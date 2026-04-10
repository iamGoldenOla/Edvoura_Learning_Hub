/**
 * Interacts with the central privileged API backend.
 * Provides a fetch wrapper that automatically attaches authorization when configured.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string; // Optional JWT token to inject into SSR fetch calls
}

export const apiClient = {
  async fetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const url = new URL(`${API_BASE_URL}${path}`);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.method !== 'GET' && options.method !== 'DELETE') {
      headers.set('Content-Type', 'application/json');
    }
    
    if (options.token) {
      headers.set('Authorization', `Bearer ${options.token}`);
    } else {
      // In a client-side context, we will retrieve the token from Supabase Auth
      // Implementation pending Supabase integration
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  },

  get<T>(path: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body: any, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) });
  },

  patch<T>(path: string, body: any, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  },

  put<T>(path: string, body: any, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },

  delete<T>(path: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'DELETE' });
  },
};
