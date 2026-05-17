import type { LedgerResponse } from '../../types/ledger.types';

export function generateMockLedger(page = 1, limit = 20): LedgerResponse {
  const types = ['ESCROW_RESERVE', 'PLATFORM_REVENUE', 'REIMBURSEMENT_PAYMENT', 'REFUND', 'DISPUTE_HOLD'] as const;
  const statuses = ['COMPLETED', 'PENDING', 'FAILED'] as const;
  const names = ['John Doe', 'Sarah Williams', 'Pizza Palace', 'Mike Delivery', 'Platform'];

  const transactions = Array.from({ length: limit }).map((_, i) => ({
    id: `txn-${page}-${i}`,
    orderId: `AE-20${Math.floor(Math.random() * 100)}`,
    type: types[Math.floor(Math.random() * types.length)],
    amount: (Math.random() * 500 + 20).toFixed(2),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    userId: Math.random() > 0.3 ? `usr-${Math.floor(Math.random() * 1000)}` : null,
    userName: names[Math.floor(Math.random() * names.length)],
    description: `Mock transaction — page ${page}, item ${i}`,
    createdAt: new Date(Date.now() - Math.random() * 10_000_000_000).toISOString(),
  }));

  return {
    success: true,
    total: 250,
    summary: {
      totalEscrow: 125_430.50,
      platformRevenue: 45_230.75,
      pendingPayouts: 28_500.00,
      totalRefunds: 3_420.00,
    },
    transactions,
  };
}
