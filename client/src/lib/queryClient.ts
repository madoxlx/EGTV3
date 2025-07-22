import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  const mergedOptions = options 
    ? { ...defaultOptions, ...options } 
    : defaultOptions;

  // Only log in development mode and for non-GET requests
  if (process.env.NODE_ENV === 'development' && mergedOptions.method !== 'GET') {
    if (mergedOptions.body) {
      try {
        const bodyData = JSON.parse(mergedOptions.body as string);
        if (bodyData && Object.keys(bodyData).length > 0) {
          console.log(`API ${mergedOptions.method} ${url}:`, bodyData);
        }
      } catch (e) {
        console.log(`API ${mergedOptions.method} ${url}:`, mergedOptions.body);
      }
    }
  }
  
  const res = await fetch(url, mergedOptions);
  
  if (!res.ok) {
    const text = await res.text();
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error ${res.status}:`, text);
    }
    throw new Error(`${res.status}: ${text}`);
  }
  
  // Handle 204 No Content responses (for DELETE operations)
  if (res.status === 204) {
    return null as T;
  }
  
  // Check if response is JSON before parsing
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const result = await res.json();
    return result;
  } else {
    // If not JSON, return the text response
    const textResult = await res.text();
    if (process.env.NODE_ENV === 'development') {
      console.error('Non-JSON response received:', textResult.substring(0, 200));
    }
    throw new Error(`Expected JSON response but received ${contentType || 'unknown content-type'}`);
  }
}

// Legacy apiRequest function for backwards compatibility
export async function legacyApiRequest<T = any>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  const mergedOptions = options 
    ? { ...defaultOptions, ...options } 
    : defaultOptions;

  const res = await fetch(url, mergedOptions);
  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options?: {
  on401?: UnauthorizedBehavior;
}) => QueryFunction<T> =
  (options) =>
  async ({ queryKey }) => {
    const unauthorizedBehavior = options?.on401 || "throw";
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache instead of Infinity
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 1, // Allow 1 retry instead of none
    },
    mutations: {
      retry: 1,
    },
  },
});
