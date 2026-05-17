import { useState } from "react";
import { Search, Filter, Ban, CheckCircle, AlertCircle, Loader2, Users, X, MapPin, Star, CreditCard, Activity, Mail, Phone, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { PaginationBar, StatusBadge, StatCard } from "../../components/ui";

const ITEMS_PER_PAGE = 20;

export function Deliverers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // Filters by User status: ACTIVE / BANNED
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedDeliverer, setSelectedDeliverer] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.deliverers.list({
      page: currentPage,
      status: statusFilter,
      search: searchQuery,
    }),
    queryFn: async () => {
      const params = new URLSearchParams({
        role: "DELIVERER",
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      // The filter now correctly maps to the user's account status (ACTIVE/BANNED)
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      const res = await api.get(`/v1/users?${params.toString()}`);
      return res.data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "ACTIVE" | "BANNED" }) =>
      api.patch(`/v1/users/${userId}/status`, { status, reason: "Admin Action" }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deliverers.all });
      if (selectedDeliverer && selectedDeliverer.id === variables.userId) {
        setSelectedDeliverer({ ...selectedDeliverer, status: variables.status });
      }
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || "Failed to update deliverer status"),
  });

  const deliverers = response?.users || [];
  const totalDeliverers = response?.total || 0;
  const totalPages = Math.ceil(totalDeliverers / ITEMS_PER_PAGE);

  const handleStatusChange = (status: "ACTIVE" | "BANNED") => {
    if (!selectedDeliverer) return;
    toggleStatusMutation.mutate({ userId: selectedDeliverer.id, status });
  };

  const selectBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
    backgroundSize: "1.25rem",
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Fleet Management</h1>
          <p className="text-muted-foreground font-medium">Total of {totalDeliverers} deliverers in system</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{errorMsg}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Verified Fleet"
          value={totalDeliverers}
          icon={Users}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
      </div>

      {/* Filters & Search */}
      <div
        className="rounded-2xl p-4 border backdrop-blur-xl flex flex-col md:flex-row gap-4"
        style={{ background: "rgba(17, 24, 39, 0.7)", borderColor: "rgba(75, 85, 99, 0.3)" }}
      >
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 outline-none appearance-none min-w-[160px]"
            style={selectBg}
          >
            <option value="ALL">All Accounts</option>
            <option value="ACTIVE">Active / Online</option>
            <option value="BANNED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border backdrop-blur-xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(17, 24, 39, 0.7)", borderColor: "rgba(75, 85, 99, 0.3)" }}
      >
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase animate-pulse">
                Scanning fleet data...
              </p>
            </div>
          ) : isError ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-foreground text-lg font-bold">Fleet Sync Failed</h3>
              <p className="text-muted-foreground mt-2">Unable to connect to deliverer services.</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-secondary/30">
                  <tr className="border-b border-border/50">
                    {["Deliverer", "Account Status", "Presence", "Metrics", "Earnings", "Actions"].map((h, i) => (
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
                  {deliverers.map((deliverer: any) => (
                    <tr
                      key={deliverer.id}
                      onClick={() => setSelectedDeliverer(deliverer)}
                      className="admin-table-row transition-colors group cursor-pointer hover:bg-secondary/40"
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                            {deliverer.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-foreground font-bold">{deliverer.fullName}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{deliverer.astuEmail || deliverer.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <StatusBadge status={deliverer.status} />
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                            deliverer.delivererProfile?.isOnline ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-secondary text-muted-foreground border-border"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${deliverer.delivererProfile?.isOnline ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
                          {deliverer.delivererProfile?.isOnline ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-foreground font-black tabular-nums">
                        ⭐ {Number(deliverer.delivererProfile?.rating || 0).toFixed(1)}
                        <span className="text-[10px] text-muted-foreground font-bold ml-2 uppercase">
                          {deliverer.delivererProfile?.totalDeliveries || 0} Jobs
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-foreground font-black tabular-nums">
                          ETB {Number(deliverer.delivererProfile?.totalEarnings || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <button className="p-2 text-primary bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {deliverers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No deliverers found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="p-6 border-t border-border bg-secondary/10">
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  total={totalDeliverers}
                  pageSize={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Centered Modal for Deliverer Details */}
      {selectedDeliverer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 transition-opacity">
          <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Deliverer Overview</h2>
              <button onClick={() => setSelectedDeliverer(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              {/* Header Info */}
              <div className="flex flex-col items-center text-center p-6 bg-secondary/30 rounded-2xl border border-border shadow-inner">
                <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-3xl font-black mb-4">
                  {selectedDeliverer.fullName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-foreground">{selectedDeliverer.fullName}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={selectedDeliverer.status} />
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${
                      selectedDeliverer.delivererProfile?.isOnline ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-secondary text-muted-foreground border-border"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedDeliverer.delivererProfile?.isOnline ? "bg-green-400 animate-pulse" : "bg-muted-foreground"}`} />
                    {selectedDeliverer.delivererProfile?.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Contact Information</h3>
                <div className="space-y-4 bg-secondary/30 p-5 rounded-xl border border-border shadow-inner">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Email Address</p>
                      <p className="font-medium text-foreground">{selectedDeliverer.email || selectedDeliverer.astuEmail || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Phone Number</p>
                      <p className="font-medium text-foreground">{selectedDeliverer.phoneNumber || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/30 p-4 rounded-xl border border-border flex flex-col justify-center shadow-inner">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-orange-400" /> Rating
                    </p>
                    <p className="text-xl font-black text-foreground">{Number(selectedDeliverer.delivererProfile?.rating || 0).toFixed(1)}</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-xl border border-border flex flex-col justify-center shadow-inner">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-blue-400" /> Total Jobs
                    </p>
                    <p className="text-xl font-black text-foreground">{selectedDeliverer.delivererProfile?.totalDeliveries || 0}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Admin Actions */}
            <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mb-2">Administrative Actions</h3>
              
              {selectedDeliverer.status === "ACTIVE" ? (
                <button
                  disabled={toggleStatusMutation.isPending}
                  onClick={() => handleStatusChange("BANNED")}
                  className="w-full bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Ban size={18} />
                  Suspend Deliverer Account
                </button>
              ) : (
                <button
                  disabled={toggleStatusMutation.isPending}
                  onClick={() => handleStatusChange("ACTIVE")}
                  className="w-full bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  Reactivate Deliverer Account
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
