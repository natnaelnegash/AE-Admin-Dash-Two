import { DisputeStatus } from '../constants/enums';

export interface Dispute {
  id: string;
  orderId: string; // short ID e.g. "AE-2048"
  raisedById: string;
  raisedByName: string;
  reason: string;
  evidence: string | null;
  status: DisputeStatus;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DisputesResponse {
  success: boolean;
  total: number;
  disputes: Dispute[];
}

export interface ResolveDisputePayload {
  status: 'RESOLVED' | 'DISMISSED';
  resolution: string;
}
