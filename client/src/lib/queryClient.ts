import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string, 
  data?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  console.log(`API ${method} ${url}:`, data);
  
  const res = await fetch(url, options);
  
  console.log(`Response status: ${res.status}`);
  
  if (!res.ok) {
    const text = await res.text();
    console.error(`API Error ${res.status}:`, text);
    throw new Error(`${res.status}: ${text}`);
  }
  
  const result = await res.json();
  console.log(`API Response:`, result);
  return result;
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
