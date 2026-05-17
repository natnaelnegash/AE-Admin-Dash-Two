// ─── Order Lifecycle ──────────────────────────────────────────────────────────
export const OrderStatus = {
  CREATED: 'CREATED',
  AWAITING_ACCEPT: 'AWAITING_ACCEPT',
  ASSIGNED: 'ASSIGNED',
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  VENDOR_BEING_PREPARED: 'VENDOR_BEING_PREPARED',
  VENDOR_FINISHED: 'VENDOR_FINISHED',
  VENDOR_READY_FOR_PICKUP: 'VENDOR_READY_FOR_PICKUP',
  PICKED_UP: 'PICKED_UP',
  EN_ROUTE: 'EN_ROUTE',
  ARRIVED: 'ARRIVED',
  RECEIVED: 'RECEIVED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED',
  NO_DELIVERER_FOUND: 'NO_DELIVERER_FOUND',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// ─── Payment ──────────────────────────────────────────────────────────────────
export const PaymentStatus = {
  AWAITING_PAYMENT: 'AWAITING_PAYMENT',
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// ─── Users ────────────────────────────────────────────────────────────────────
export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  DELIVERER: 'DELIVERER',
  VENDOR_STAFF: 'VENDOR_STAFF',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
  PENDING: 'PENDING',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// ─── Verification ─────────────────────────────────────────────────────────────
export const VerificationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

// ─── Disputes ─────────────────────────────────────────────────────────────────
export const DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
} as const;
export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus];

// ─── Ledger ───────────────────────────────────────────────────────────────────
export const LedgerTransactionType = {
  ESCROW_RESERVE: 'ESCROW_RESERVE',
  REIMBURSEMENT_PAYMENT: 'REIMBURSEMENT_PAYMENT',
  PLATFORM_REVENUE: 'PLATFORM_REVENUE',
  REFUND: 'REFUND',
  DISPUTE_HOLD: 'DISPUTE_HOLD',
} as const;
export type LedgerTransactionType = (typeof LedgerTransactionType)[keyof typeof LedgerTransactionType];

export const LedgerEntryStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type LedgerEntryStatus = (typeof LedgerEntryStatus)[keyof typeof LedgerEntryStatus];

// ─── Restaurants ──────────────────────────────────────────────────────────────
export const VendorMode = {
  VENDOR_MANAGED: 'VENDOR_MANAGED',
  ADMIN_MANAGED: 'ADMIN_MANAGED',
} as const;
export type VendorMode = (typeof VendorMode)[keyof typeof VendorMode];
