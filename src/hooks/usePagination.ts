import { useState } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

/**
 * Encapsulates page state and derived values so page components
 * don't need to repeat the same useState + Math.ceil logic.
 *
 * @example
 * const { page, pageSize, totalPages, setPage, reset } = usePagination({ pageSize: 20 });
 * useQuery({ queryKey: ['users', page], queryFn: () => api.getUsers({ page, limit: pageSize }) });
 */
export function usePagination(total: number, options: UsePaginationOptions = {}) {
  const { initialPage = 1, pageSize = 20 } = options;
  const [page, setPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const reset = () => setPage(1);

  const goNext = () => setPage((p) => Math.min(p + 1, totalPages));
  const goPrev = () => setPage((p) => Math.max(p - 1, 1));

  return {
    page,
    pageSize,
    totalPages,
    from,
    to,
    setPage,
    reset,
    goNext,
    goPrev,
    canGoNext: page < totalPages,
    canGoPrev: page > 1,
  };
}
