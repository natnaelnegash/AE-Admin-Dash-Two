/**
 * Centralized React Query key factory.
 * Using arrays with structured objects prevents key collisions and
 * makes targeted cache invalidation simple and predictable.
 *
 * Usage:
 *   useQuery({ queryKey: QUERY_KEYS.orders.list({ page: 1, status: 'OPEN' }) })
 *   queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all })
 */

export const QUERY_KEYS = {
  // ── Users ──────────────────────────────────────────────────────────────────
  users: {
    all: ['users'] as const,
    list: (params: Record<string, unknown>) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },

  // ── Deliverers ─────────────────────────────────────────────────────────────
  deliverers: {
    all: ['deliverers'] as const,
    list: (params: Record<string, unknown>) => ['deliverers', 'list', params] as const,
    detail: (id: string) => ['deliverers', 'detail', id] as const,
  },

  // ── Vendors ────────────────────────────────────────────────────────────────
  vendors: {
    all: ['vendors'] as const,
    list: (params: Record<string, unknown>) => ['vendors', 'list', params] as const,
  },

  // ── Restaurants ────────────────────────────────────────────────────────────
  restaurants: {
    all: ['restaurants'] as const,
    list: (params: Record<string, unknown>) => ['restaurants', 'list', params] as const,
    detail: (id: string) => ['restaurants', 'detail', id] as const,
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  orders: {
    all: ['orders'] as const,
    list: (params: Record<string, unknown>) => ['orders', 'list', params] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },

  // ── Verification ───────────────────────────────────────────────────────────
  verifications: {
    all: ['verifications'] as const,
    deliverers: (params: Record<string, unknown>) => ['verifications', 'deliverers', params] as const,
    vendors: (params: Record<string, unknown>) => ['verifications', 'vendors', params] as const,
  },

  // ── Disputes ───────────────────────────────────────────────────────────────
  disputes: {
    all: ['disputes'] as const,
    list: (params: Record<string, unknown>) => ['disputes', 'list', params] as const,
    detail: (id: string) => ['disputes', 'detail', id] as const,
  },

  // ── Ledger ─────────────────────────────────────────────────────────────────
  ledger: {
    all: ['ledger'] as const,
    list: (params: Record<string, unknown>) => ['ledger', 'list', params] as const,
  },

  // ── System Config ──────────────────────────────────────────────────────────
  config: {
    all: ['system-config'] as const,
    detail: (key: string) => ['system-config', key] as const,
  },

  // ── Analytics ──────────────────────────────────────────────────────────────
  analytics: {
    overview: ['analytics', 'overview'] as const,
  },
} as const;
