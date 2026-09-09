import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => void;
}

interface UseApiOptions<T> {
  /** Whether the hook should fetch immediately. Default: true */
  enabled?: boolean;
  /** Initial data to return before the first fetch completes */
  initialData?: T | null;
  /** Number of retry attempts on failure. Default: 2 */
  retryCount?: number;
  /** Base delay in ms for exponential backoff between retries. Default: 1000 */
  retryDelayMs?: number;
  /** Stale time in ms. If data is older than this, refetch in background. Default: 0 (disabled) */
  staleTimeMs?: number;
  /** Callback invoked when an error occurs (after all retries are exhausted) */
  onError?: (error: Error) => void;
}

/**
 * Custom hook for API data fetching with:
 * - Loading / error / data states
 * - Automatic retry with exponential backoff
 * - Stale-while-revalidate support
 * - Request abort on unmount / re-fetch
 *
 * @param fetcher - Async function that returns the data
 * @param deps - Dependency array that triggers re-fetch when changed
 * @param options - Configuration options
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const {
    enabled = true,
    initialData = null,
    retryCount = 2,
    retryDelayMs = 1000,
    staleTimeMs = 0,
    onError,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: enabled,
    error: null,
  });

  // Keep track of the latest fetcher to avoid stale closures
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Track data freshness for stale-while-revalidate
  const lastFetchTimeRef = useRef<number>(0);

  // Abort controller for cleanup
  const abortRef = useRef<AbortController | null>(null);

  // Callbacks ref to avoid re-render loops
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const execute = useCallback(async (isBackgroundRevalidation = false) => {
    if (!enabled) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const currentController = abortRef.current;

    // Only show loading state for foreground fetches
    if (!isBackgroundRevalidation) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    let lastError: Error | null = null;
    const maxAttempts = 1 + retryCount; // initial + retries

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        // Wait before retry (exponential backoff)
        if (attempt > 0) {
          const delay = retryDelayMs * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Check if aborted during wait
          if (currentController.signal.aborted) return;
        }

        const data = await fetcherRef.current();

        // Only update if not aborted
        if (!currentController.signal.aborted) {
          setState({ data, loading: false, error: null });
          lastFetchTimeRef.current = Date.now();
        }
        return; // Success — exit retry loop
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        if (currentController.signal.aborted) return;

        lastError = error instanceof Error ? error : new Error(String(error));

        // Log retry attempts in dev
        if (attempt < maxAttempts - 1) {
          console.warn(
            `[useApi] Attempt ${attempt + 1}/${maxAttempts} failed, retrying...`,
            lastError.message
          );
        }
      }
    }

    // All attempts exhausted
    if (!currentController.signal.aborted && lastError) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: lastError,
      }));
      onErrorRef.current?.(lastError);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, retryCount, retryDelayMs, ...deps]);

  useEffect(() => {
    // Check if we can serve stale data and revalidate in background
    if (
      staleTimeMs > 0 &&
      state.data !== null &&
      lastFetchTimeRef.current > 0 &&
      Date.now() - lastFetchTimeRef.current < staleTimeMs
    ) {
      // Data is still fresh — skip fetch
      return;
    }

    if (
      staleTimeMs > 0 &&
      state.data !== null &&
      lastFetchTimeRef.current > 0
    ) {
      // Data is stale — revalidate in background (don't show loading)
      execute(true);
    } else {
      // No data yet or stale-while-revalidate disabled — foreground fetch
      execute(false);
    }

    return () => {
      abortRef.current?.abort();
    };
  }, [execute, staleTimeMs]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    execute(false);
  }, [execute]);

  return { ...state, refetch };
}
