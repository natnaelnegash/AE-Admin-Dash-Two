import { OrderStatus, PaymentStatus } from '../constants/enums';

// ─── Core Order ───────────────────────────────────────────────────────────────
export interface OrderListItem {
  id: string;
  shortId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: string;
  foodPrice: string;
  deliveryFee: string;
  serviceFee: string;
  createdAt: string;
  restaurant: {
    name: string;
    location: string;
  };
  customer: {
    user: {
      fullName: string;
      phoneNumber: string | null;
    };
  };
  deliverer?: {
    user: {
      fullName: string;
      phoneNumber: string | null;
    };
    rating: string;
  } | null;
}

export interface OrderDetail extends OrderListItem {
  otpCode: string;
  updatedAt: string;
  tip: string;
  transactionFee: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  product: {
    name: string;
  };
}

export interface OrdersResponse {
  success: boolean;
  total: number;
  orders: OrderListItem[];
}
