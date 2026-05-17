import {
  X,
  Clock,
  Receipt,
  Package,
  User,
  Truck,
  CreditCard,
  Loader2,
  XCircle,
  Info,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { QUERY_KEYS } from "../../constants/queryKeys";

function Radio({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </svg>
  );
}

const STATUS_COLOR: Record<string, string> = {
  CREATED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  AWAITING_ACCEPT:
    "bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse",
  ASSIGNED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  AWAITING_PAYMENT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAYMENT_RECEIVED: "bg-green-500/20 text-green-400 border-green-500/30",
  VENDOR_BEING_PREPARED:
    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  VENDOR_READY_FOR_PICKUP:
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
  PICKED_UP: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  EN_ROUTE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ARRIVED: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  COMPLETED: "bg-green-500/20 text-green-400 border-green-500/30",
  DISPUTED: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
};

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const queryClient = useQueryClient();

  const { data: orderDetails, isLoading } = useQuery({
    queryKey: QUERY_KEYS.orders.detail(orderId),
    queryFn: async () => {
      const response = await api.get(`/v1/orders/${orderId}`);
      return response.data.data;
    },
    enabled: !!orderId,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (data: { id: string; reason: string }) =>
      api.post(`/v1/orders/${data.id}/cancel`, { reason: data.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orders.detail(orderId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all });
      onClose();
    },
  });

  const retryPayoutMutation = useMutation({
    mutationFn: (id: string) => api.post(`/v1/orders/${id}/retry-payout`),
  });

  const handleCancel = () => {
    const reason = prompt("Enter cancellation reason:");
    if (reason) cancelOrderMutation.mutate({ id: orderId, reason });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
      <div className="admin-card w-full max-w-4xl my-auto rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(249,115,22,0.15)]">
        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-[10px]">
              Downloading Manifest...
            </p>
          </div>
        ) : orderDetails ? (
          <div className="flex flex-col h-full">
            {/* Modal Header */}
            <div className="p-8 pb-0 flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-black text-foreground tracking-tighter">
                    #{orderDetails.shortId}
                  </h2>
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${STATUS_COLOR[orderDetails.status] || "bg-secondary text-muted-foreground"}`}
                  >
                    {orderDetails.status?.replace(/_/g, " ") || "UNKNOWN"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-sm font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    {new Date(orderDetails.createdAt).toLocaleString()}
                  </div>
                  <div className="w-1 h-1 bg-border rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <Receipt size={16} />
                    Escrow: {orderDetails.paymentStatus}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-2xl transition-all group"
              >
                <X
                  size={24}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      Merchant
                    </h4>
                    <div className="p-5 bg-secondary/30 rounded-3xl border border-border flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                        <Package size={24} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-foreground font-bold">
                          {orderDetails.restaurant?.name}
                        </p>
                        <p className="text-muted-foreground text-xs font-medium truncate max-w-[150px]">
                          {orderDetails.restaurant?.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                      Customer
                    </h4>
                    <div className="p-5 bg-secondary/30 rounded-3xl border border-border flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <User size={24} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-foreground font-bold">
                          {orderDetails.customer?.user?.fullName}
                        </p>
                        <p className="text-muted-foreground text-xs font-medium">
                          {orderDetails.customer?.user?.phoneNumber ||
                            "No phone"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispatch Status */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Dispatch Status
                  </h4>
                  <div className="p-6 bg-secondary/30 rounded-3xl border border-border flex items-center justify-between">
                    {orderDetails.deliverer ? (
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/20">
                          <Truck size={32} className="text-green-500" />
                        </div>
                        <div>
                          <p className="text-foreground font-black text-lg">
                            {orderDetails.deliverer.user.fullName}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-muted-foreground text-sm font-medium">
                              {orderDetails.deliverer.user.phoneNumber}
                            </span>
                            <div className="w-1 h-1 bg-border rounded-full" />
                            <span className="text-yellow-400 text-sm font-bold">
                              ⭐ {orderDetails.deliverer.rating || "5.0"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <Radio size={32} className="text-primary" />
                        </div>
                        <p className="text-primary font-bold italic">
                          Awaiting Acceptance...
                        </p>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1">
                        Handshake OTP
                      </p>
                      <p className="text-foreground font-mono text-2xl font-black tracking-widest bg-secondary px-4 py-1 rounded-xl border border-border">
                        {orderDetails.otpCode || "----"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Intervention */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    Admin Intervention
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      disabled={
                        cancelOrderMutation.isPending ||
                        ["CANCELLED", "COMPLETED"].includes(orderDetails.status)
                      }
                      onClick={handleCancel}
                      className="flex items-center justify-center gap-3 p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    >
                      {cancelOrderMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <XCircle size={18} />
                      )}
                      Force Terminate
                    </button>
                    <button
                      disabled={
                        retryPayoutMutation.isPending ||
                        orderDetails.status !== "COMPLETED"
                      }
                      onClick={() =>
                        retryPayoutMutation.mutate(orderDetails.id)
                      }
                      className="flex items-center justify-center gap-3 p-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl border border-primary/20 font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    >
                      {retryPayoutMutation.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CreditCard size={18} />
                      )}
                      Retry Payout
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Manifest */}
              <div className="bg-secondary/30 p-8 rounded-[2rem] border border-border/50 space-y-8">
                <section>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">
                    Manifest
                  </h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {orderDetails.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-secondary text-muted-foreground rounded-xl text-xs font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {item.quantity}
                          </span>
                          <span className="text-foreground font-medium text-sm">
                            {item.product?.name || "Menu Item"}
                          </span>
                        </div>
                        <span className="text-foreground font-bold text-sm">
                          ETB {Number(item.unitPrice).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4 pt-6 border-t border-border">
                  <div className="flex justify-between text-muted-foreground text-sm font-medium">
                    <span>Net Food Price</span>
                    <span>ETB {Number(orderDetails.foodPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm font-medium">
                    <span>Logistics Fee</span>
                    <span>
                      ETB {Number(orderDetails.deliveryFee).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm font-medium">
                    <span>System Fee</span>
                    <span>
                      ETB {Number(orderDetails.serviceFee).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-primary font-black text-2xl pt-4 border-t border-border/50">
                    <span className="tracking-tighter">Gross Total</span>
                    <span className="tabular-nums">
                      ETB {Number(orderDetails.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </section>

                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
                  <Info size={16} className="text-primary flex-shrink-0" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Funds are held in secure escrow until the delivery handshake
                    is confirmed via OTP.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
