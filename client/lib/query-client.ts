import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * OFFLINE MODE: Backend API disabled
 * App uses local SQLite database exclusively
 */
export function getApiUrl(): string {
  console.warn("[API] App is running in OFFLINE mode. No backend API available.");
  return ""; // Not used
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * OFFLINE MODE: apiRequest is disabled
 * All data operations use local SQLite database via AppContext
 */
export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.warn("[API] Attempted API call in offline mode:", method, route);
  throw new Error("Offline mode: Backend API is disabled. Use local database instead.");
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // OFFLINE MODE: This function should not be called
    // All queries should use AppContext with local database instead
    console.error(
      "[QueryClient] getQueryFn called in offline mode. This should not happen. queryKey:",
      queryKey
    );
    throw new Error(
      "Offline mode: Query functions should use AppContext with local SQLite database, not React Query with API calls."
    );
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
