import { useCallback, useRef } from 'react';

/**
 * Returns a debounced version of the given callback.
 * Useful for live search inputs — delays the API call until the user pauses typing.
 *
 * @example
 * const debouncedSearch = useDebounce((term: string) => setSearch(term), 400);
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay]
  );
}
