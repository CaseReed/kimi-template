import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60s
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      console.error(`Query error for key [${query.queryKey.join(", ")}]:`, error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  }),
});

export type QueryClientType = typeof queryClient;

export default queryClient;

export type QueryKey = readonly unknown[];

export type { DefaultError } from "@tanstack/react-query";
export type { QueryOptions } from "@tanstack/react-query";
export type { UseQueryOptions } from "@tanstack/react-query";
export type { MutationOptions } from "@tanstack/react-query";
export type { UseMutationOptions } from "@tanstack/react-query";

export const CACHE_TIMES = {
  short: 5 * 60 * 1000, // 5 minutes
  medium: 15 * 60 * 1000, // 15 minutes
  long: 60 * 60 * 1000, // 1 hour
  persistent: 24 * 60 * 60 * 1000, // 24 hours
} as const;

export async function invalidateQueriesByPrefix(prefix: string[]) {
  return queryClient.invalidateQueries({
    queryKey: prefix,
  });
}

export async function prefetchQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  options?: { staleTime?: number }
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 60 * 1000,
  });
}

export function setQueryData<T>(queryKey: readonly unknown[], data: T) {
  queryClient.setQueryData(queryKey, data);
}

export function getQueryData<T>(queryKey: readonly unknown[]): T | undefined {
  return queryClient.getQueryData<T>(queryKey);
}

export async function cancelQueries(queryKey: readonly unknown[]) {
  await queryClient.cancelQueries({ queryKey });
}

export async function resetQueries(queryKey: readonly unknown[]) {
  await queryClient.resetQueries({ queryKey });
}

export function removeQueries(queryKey: readonly unknown[]) {
  queryClient.removeQueries({ queryKey });
}

export function clearAllQueries() {
  queryClient.clear();
}

export function hasQuery(queryKey: readonly unknown[]): boolean {
  return queryClient.getQueryCache().find({ queryKey }) !== undefined;
}

export async function invalidateDashboardQueries() {
  await invalidateQueriesByPrefix(["dashboard"]);
}

export const queryConfig = {
  persistent: {
    staleTime: CACHE_TIMES.long,
    gcTime: CACHE_TIMES.persistent,
  },
  standard: {
    staleTime: 60 * 1000,
    gcTime: CACHE_TIMES.medium,
  },
  realtime: {
    staleTime: 0,
    gcTime: CACHE_TIMES.short,
    refetchInterval: 30 * 1000,
  },
  noCache: {
    staleTime: 0,
    gcTime: 0,
  },
  infinite: {
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  },
} as const;

export const mutationConfig = {
  standard: {
    retry: 1,
  },
  critical: {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  noRetry: {
    retry: 0,
  },
} as const;

export const isQueryLoading = (status: string) => status === "pending";
export const isQuerySuccess = (status: string) => status === "success";
export const isQueryError = (status: string) => status === "error";

export const isMutationPending = (status: string) => status === "pending";
export const isMutationSuccess = (status: string) => status === "success";
export const isMutationError = (status: string) => status === "error";
export const isMutationIdle = (status: string) => status === "idle";
