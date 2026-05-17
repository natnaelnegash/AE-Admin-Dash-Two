import type { DisputesResponse } from '../../types/dispute.types';

const RAISED_BY_NAMES = ['John Doe', 'Sarah Williams', 'Mike Delivery'];
const STATUSES = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'] as const;

export function generateMockDisputes(page = 1, limit = 20): DisputesResponse {
  const disputes = Array.from({ length: limit }).map((_, i) => ({
    id: `disp-${page}-${i}`,
    orderId: `AE-20${Math.floor(Math.random() * 100)}`,
    raisedById: `usr-${Math.floor(Math.random() * 1000)}`,
    raisedByName: RAISED_BY_NAMES[Math.floor(Math.random() * RAISED_BY_NAMES.length)],
    reason: `Item was missing or damaged. Dispute filed on page ${page}, item ${i}.`,
    evidence: Math.random() > 0.5 ? 'https://example.com/evidence.jpg' : null,
    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
    resolution: Math.random() > 0.7 ? 'Refunded customer in full.' : null,
    createdAt: new Date(Date.now() - Math.random() * 10_000_000_000).toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  return { success: true, total: 120, disputes };
}
