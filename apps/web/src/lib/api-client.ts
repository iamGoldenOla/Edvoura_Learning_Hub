/**
 * Interacts with the central privileged API backend.
 * Provides a fetch wrapper that automatically attaches authorization when configured.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';
const API_BASE_URL_FALLBACK = API_BASE_URL.includes('127.0.0.1')
  ? API_BASE_URL.replace('127.0.0.1', 'localhost')
  : API_BASE_URL.includes('localhost')
    ? API_BASE_URL.replace('localhost', '127.0.0.1')
    : null;

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  token?: string; // Optional JWT token to inject into SSR fetch calls
}

export const apiClient = {
  async fetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const buildUrl = (baseUrl: string) => {
      const url = new URL(`${baseUrl}${path}`);
      if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }
      return url;
    };

    const url = buildUrl(API_BASE_URL);
    
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && options.method !== 'GET' && options.method !== 'DELETE') {
      headers.set('Content-Type', 'application/json');
    }
    
    if (options.token) {
      headers.set('Authorization', `Bearer ${options.token}`);
    } else {
      if (typeof window !== 'undefined') {
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          headers.set('Authorization', `Bearer ${session.access_token}`);
        }
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        ...options,
        headers,
      });
    } catch (error) {
      if (error instanceof TypeError && API_BASE_URL_FALLBACK) {
        try {
          const fallbackUrl = buildUrl(API_BASE_URL_FALLBACK);
          response = await fetch(fallbackUrl.toString(), {
            ...options,
            headers,
          });
        } catch {
          throw new Error(
            `Cannot reach API at ${API_BASE_URL} or ${API_BASE_URL_FALLBACK}. Ensure backend server is running and reachable.`,
          );
        }
      } else if (error instanceof TypeError) {
        throw new Error(`Cannot reach API at ${API_BASE_URL}. Ensure backend server is running and reachable.`);
      }
      else {
        throw error;
      }
    }

    if (!response.ok) {
      const raw = await response.text().catch(() => '');
      let errorData: { message?: string } = {};
      if (raw.trim().length > 0) {
        try {
          errorData = JSON.parse(raw) as { message?: string };
        } catch {
          errorData = {};
        }
      }
      if (response.status === 403) {
        const detail = errorData.message?.trim();
        throw new Error(
          detail && detail.length > 0
            ? `Access denied: ${detail}`
            : 'Access denied: Super admin permission required for this action.',
        );
      }
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const raw = await response.text().catch(() => '');
    if (raw.trim().length === 0) {
      return {} as T;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return {} as T;
    }
  },

  get<T>(path: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) });
  },

  patch<T>(path: string, body: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) });
  },

  put<T>(path: string, body: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) });
  },

  delete<T>(path: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(path, { ...options, method: 'DELETE' });
  },
};
