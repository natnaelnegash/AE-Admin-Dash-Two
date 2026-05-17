import { LedgerTransactionType, LedgerEntryStatus } from '../constants/enums';

export interface LedgerEntry {
  id: string;
  orderId: string;
  type: LedgerTransactionType;
  amount: string;
  status: LedgerEntryStatus;
  userId: string | null;
  userName: string | null;
  description: string | null;
  createdAt: string;
}

export interface LedgerSummary {
  totalEscrow: number;
  platformRevenue: number;
  pendingPayouts: number;
  totalRefunds: number;
}

export interface LedgerResponse {
  success: boolean;
  total: number;
  summary: LedgerSummary;
  transactions: LedgerEntry[];
}
