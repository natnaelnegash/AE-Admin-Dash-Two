import { useState } from "react";
import {
  Search,
  Eye,
  Package,
  Truck,
  Clock,
  User,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  History,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { OrderDetailModal } from "./OrderDetailModal";
import { PaginationBar } from "../../components/ui";

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

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  CREATED: {
    label: "Created",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    icon: Clock,
  },
  AWAITING_ACCEPT: {
    label: "Broadcasting",
    color:
      "bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse",
    icon: Radio,
  },
  ASSIGNED: {
    label: "Assigned",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: User,
  },
  AWAITING_PAYMENT: {
    label: "Awaiting Payment",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: AlertTriangle,
  },
  PAYMENT_RECEIVED: {
    label: "Paid",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: CheckCircle2,
  },
  VENDOR_BEING_PREPARED: {
    label: "Preparing",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: Package,
  },
  VENDOR_READY_FOR_PICKUP: {
    label: "Ready for Pickup",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: Package,
  },
  PICKED_UP: {
    label: "Picked Up",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Truck,
  },
  EN_ROUTE: {
    label: "En Route",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Truck,
  },
  ARRIVED: {
    label: "Arrived",
    color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    icon: MapPin,
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: CheckCircle2,
  },
  DISPUTED: {
    label: "Disputed",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: AlertTriangle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: XCircle,
  },
};

const ITEMS_PER_PAGE = 20;

export function OrdersDispatch() {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "dispatch">("table");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: ordersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.orders.list({
      page: currentPage,
      status: statusFilter,
      search: searchQuery,
    }),
    queryFn: async () => {
      const params = new URLSearchParams({
        roleAs: "ADMIN",
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      const response = await api.get(`/v1/orders?${params.toString()}`);
      return response.data;
    },
    refetchInterval: statusFilter === "ALL" ? 10000 : false,
  });

  const orders = ordersData?.orders || [];
  const totalOrders = ordersData?.total || 0;
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-foreground mb-2 font-bold tracking-tight">
            Dispatch Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time operations dashboard ({totalOrders} orders in current
            view)
          </p>
        </div>
        <div className="flex gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-border/50 backdrop-blur-md">
          {(["table", "dispatch"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-5 py-2 rounded-xl transition-all text-sm font-semibold ${viewMode === mode ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-muted-foreground hover:text-foreground"}`}
            >
              {mode === "table" ? "Monitor Table" : "History Logs"}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-card rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-border/50 flex flex-col md:flex-row gap-4 items-center bg-secondary/10">
          <div className="relative flex-1 w-full group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Filter by ID, Customer, Restaurant..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-6 py-3.5 bg-secondary/60 border border-border/50 rounded-2xl text-foreground placeholder-muted-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all font-medium"
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="w-full md:w-60 px-5 py-3.5 bg-secondary/60 border border-border/50 rounded-2xl text-foreground outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all font-medium appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1.25rem center",
              backgroundSize: "1.25rem",
            }}
          >
            <option value="ALL">All Active Lifecycle</option>
            {Object.entries(STATUS_CONFIG).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-5">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase animate-pulse">
                  Linking Dispatch Nodes...
                </p>
              </div>
            ) : isError ? (
              <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-foreground text-xl font-black">
                  Link Interrupted
                </h3>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  The Dispatch API is currently unreachable.
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-24 text-center text-muted-foreground font-medium">
                No orders detected in current sector.
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-secondary/40">
                    <tr>
                      {[
                        "ID",
                        "Merchant",
                        "Customer",
                        "Status",
                        "Financials",
                        "Action",
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={`px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ${i === 5 ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {orders.map((order: any) => {
                      const config = STATUS_CONFIG[order.status] || {
                        label: order.status,
                        color: "text-muted-foreground border-border",
                        icon: Package,
                      };
                      const StatusIcon = config.icon;
                      return (
                        <tr
                          key={order.id}
                          className="admin-table-row transition-colors group"
                        >
                          <td className="px-8 py-5 whitespace-nowrap">
                            <span className="text-foreground font-mono font-black text-sm tracking-tighter bg-secondary/50 px-2 py-1 rounded">
                              {order.shortId}
                            </span>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="text-sm text-foreground font-bold">
                              {order.restaurant?.name}
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="text-sm text-muted-foreground">
                              {order.customer?.user?.fullName}
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${config.color}`}
                            >
                              <StatusIcon size={12} />
                              {config.label}
                            </span>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-sm text-foreground font-black tabular-nums">
                            ETB{" "}
                            {Number(order.totalAmount).toLocaleString(
                              undefined,
                              { minimumFractionDigits: 2 },
                            )}
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedOrderId(order.id)}
                              className="p-2.5 bg-secondary hover:bg-primary text-primary hover:text-primary-foreground rounded-xl transition-all transform active:scale-95"
                            >
                              <Eye size={20} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="p-6 border-t border-border/50 bg-secondary/10">
                  <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    total={totalOrders}
                    pageSize={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mx-auto border border-border/50">
              <History size={40} className="text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-foreground text-xl font-black">
                Dispatch History
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Archived mission logs and deliverer decision history will be
                available here soon.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}
