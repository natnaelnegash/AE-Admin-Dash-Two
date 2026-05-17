import api from './api';
import { generateMockLedger } from './mocks/ledger.mock';
import { generateMockDisputes } from './mocks/disputes.mock';
import type { LedgerResponse } from '../types/ledger.types';
import type { DisputesResponse, ResolveDisputePayload } from '../types/dispute.types';
import type { DelivererApplicationsResponse, VendorApplicationsResponse } from '../types/platform.types';

// ── Feature flags ─────────────────────────────────────────────────────────────
// Set VITE_USE_MOCK=true in .env to globally enable mocks.
// Individual features override this with useLive flags below.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

// Features with confirmed live backend endpoints (override mock globally)
const LIVE = {
  disputes: true,
  verifications: true,
};

// ── Ledger & Payouts ──────────────────────────────────────────────────────────
const getLedgerTransactions = async (params: {
  page: number;
  limit: number;
}): Promise<LedgerResponse> => {
  if (USE_MOCK) return generateMockLedger(params.page, params.limit);
  const res = await api.get('/v1/ledger/platform', { params });
  return res.data;
};

// ── Dispute Resolution ────────────────────────────────────────────────────────
const getDisputes = async (params: {
  page: number;
  limit: number;
  status?: string;
}): Promise<DisputesResponse> => {
  if (!LIVE.disputes && USE_MOCK) return generateMockDisputes(params.page, params.limit);
  const res = await api.get('/v1/disputes', { params });
  return res.data;
};

const resolveDispute = async (
  id: string,
  payload: ResolveDisputePayload
): Promise<{ success: boolean; message: string }> => {
  if (!LIVE.disputes && USE_MOCK) return { success: true, message: 'Dispute resolved (mock)' };
  console.log(payload);
  
  const res = await api.patch(`/v1/disputes/${id}/resolve`, payload);
  return res.data;
};

// ── Verification Queue ────────────────────────────────────────────────────────
const getDelivererApplications = async (params: {
  page: number;
  limit: number;
}): Promise<DelivererApplicationsResponse> => {
  const res = await api.get('/v1/users/applications/deliverers', { params });
  return res.data;
};

const getVendorApplications = async (params: {
  page: number;
  limit: number;
}): Promise<VendorApplicationsResponse> => {
  const res = await api.get('/v1/users/applications/vendors', { params });
  return res.data;
};

const reviewVerification = async (
  userId: string,
  role: 'DELIVERER' | 'VENDOR_STAFF',
  payload: { status: string; reason?: string }
): Promise<{ success: boolean; message: string }> => {
  const endpoint =
    role === 'DELIVERER'
      ? `/v1/users/${userId}/deliverer-status`
      : `/v1/users/${userId}/vendor-status`;
      console.log(payload);
      
  const res = await api.patch(endpoint, payload);
  return res.data;
};

// ── Exported service object ───────────────────────────────────────────────────
export const adminService = {
  getLedgerTransactions,
  getDisputes,
  resolveDispute,
  getDelivererApplications,
  getVendorApplications,
  reviewVerification,
};
