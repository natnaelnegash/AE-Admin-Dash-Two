import { VerificationStatus } from '../constants/enums';
import { VendorMode } from '../constants/enums';

// ─── Deliverer Application ────────────────────────────────────────────────────
export interface DelivererApplication {
  id: string;
  userId: string;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  isOnline: boolean;
  currentLocation: string | null;
  rating: string;
  isAvailable: boolean;
  payoutAccount: string | null;
  payoutProvider: string | null;
  totalDeliveries: number;
  totalEarnings: string;
  user: {
    id: string;
    fullName: string;
    astuEmail: string | null;
    phoneNumber: string | null;
    status: string;
  };
}

export interface DelivererApplicationsResponse {
  success: boolean;
  total: number;
  applications: DelivererApplication[];
}

// ─── Vendor Application ───────────────────────────────────────────────────────
export interface VendorApplication {
  id: string;
  userId: string;
  restaurantId: string | null;
  isOwner: boolean;
  businessDocumentUrl: string;
  verificationStatus: VerificationStatus;
  user: {
    id: string;
    fullName: string;
    email: string | null;
    phoneNumber: string | null;
    status: string;
  };
}

export interface VendorApplicationsResponse {
  success: boolean;
  total: number;
  applications: VendorApplication[];
}

// ─── Restaurant ───────────────────────────────────────────────────────────────
export interface Restaurant {
  id: string;
  name: string;
  location: string;
  phone: string;
  lat: number;
  lng: number;
  mode: VendorMode;
  isOpen: boolean;
  effectiveIsOpen: boolean;
  avgRating: string;
  tags: string[];
  openingTime: string | null;
  closingTime: string | null;
  minOrderValue: string;
}

export interface RestaurantsResponse {
  success: boolean;
  total: number;
  restaurants: Restaurant[];
}
