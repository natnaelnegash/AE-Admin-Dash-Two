import { UserRole, UserStatus } from '../constants/enums';

// ─── Shared API wrapper ────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  data?: T[];
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  astuEmail: string | null;
  email: string | null;
  phoneNumber: string | null;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  customerProfile: {
    totalOrders: number;
  } | null;
  delivererProfile: {
    totalDeliveries: number;
    rating: string;
    isOnline: boolean;
    verificationStatus: string;
  } | null;
  vendorProfile: {
    restaurantId: string | null;
    isOwner: boolean;
    verificationStatus: string;
  } | null;
}

export interface UsersResponse {
  success: boolean;
  total: number;
  users: User[];
}
