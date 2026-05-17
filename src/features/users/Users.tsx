import { useState } from "react";
import { Search, Ban, CheckCircle, AlertCircle, Loader2, Filter, X, User as UserIcon, Mail, Phone, Calendar, Shield, Activity, ChevronRight, Hash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { PaginationBar, StatusBadge } from "../../components/ui";

const ITEMS_PER_PAGE = 20;

export function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: usersData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.users.list({ page: currentPage, search: searchQuery, role: roleFilter, status: statusFilter }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter !== "ALL") params.append("role", roleFilter);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      const res = await api.get(`/v1/users?${params.toString()}`);
      return res.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "ACTIVE" | "BANNED" }) =>
      api.patch(`/v1/users/${userId}/status`, { status, reason: "Admin action" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
      setSelectedUser(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || "Failed to update user status"),
  });

  const users = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  const handleStatusChange = (status: "ACTIVE" | "BANNED") => {
    if (!selectedUser) return;
    toggleMutation.mutate({ userId: selectedUser.id, status });
  };

  const selectBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
    backgroundSize: "1.25rem",
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Users Management</h1>
          <p className="text-muted-foreground font-medium">Total of {totalUsers} users registered</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-2xl flex items-center gap-3">
          <AlertCircle className="text-destructive shrink-0" />
          <p className="text-sm text-destructive">{errorMsg}</p>
        </div>
      )}

      {/* Filters & Search */}
      <div 
        className="rounded-2xl p-4 border backdrop-blur-xl flex flex-col md:flex-row gap-4"
        style={{ background: "rgba(17, 24, 39, 0.7)", borderColor: "rgba(75, 85, 99, 0.3)" }}
      >
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or short ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <Filter size={20} className="text-muted-foreground hidden sm:block" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto px-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 outline-none appearance-none min-w-[160px]"
            style={selectBg}
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="DELIVERER">Deliverer</option>
            <option value="VENDOR_STAFF">Vendor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto px-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 outline-none appearance-none min-w-[160px]"
            style={selectBg}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
      </div>

      <div 
        className="rounded-2xl border backdrop-blur-xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(17, 24, 39, 0.7)", borderColor: "rgba(75, 85, 99, 0.3)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-secondary/30">
              <tr className="border-b border-border/50">
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">User Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Role</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Stats</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    Loading users database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr 
                    key={user.id} 
                    onClick={() => setSelectedUser(user)}
                    className="hover:bg-secondary/40 transition-colors cursor-pointer group admin-table-row"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-foreground font-bold">{user.fullName}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{user.astuEmail || user.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-muted-foreground font-medium">
                        {user.customerProfile && <p>Orders: <span className="text-foreground font-black">{user.customerProfile.totalOrders || 0}</span></p>}
                        {user.delivererProfile && <p>Deliveries: <span className="text-foreground font-black">{user.delivererProfile.totalDeliveries || 0}</span></p>}
                        {!user.customerProfile && !user.delivererProfile && <span>-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-2 text-primary bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="p-6 border-t border-border bg-secondary/10">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              total={totalUsers}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Side Panel for User Details */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">User Overview</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center p-6 bg-secondary/30 rounded-2xl border border-border shadow-inner">
                <div className="w-20 h-20 rounded-full bg-primary/20 text-primary flex items-center justify-center text-3xl font-black mb-4">
                  {selectedUser.fullName.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-foreground">{selectedUser.fullName}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={selectedUser.role} />
                  <StatusBadge status={selectedUser.status} />
                </div>
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Personal Information</h3>
                <div className="space-y-4 bg-secondary/30 p-5 rounded-xl border border-border shadow-inner">
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-muted-foreground" />
                    <div className="overflow-hidden">
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">User ID</p>
                      <p className="font-mono text-xs text-foreground truncate">{selectedUser.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Email Address</p>
                      <p className="font-medium text-foreground">{selectedUser.email || selectedUser.astuEmail || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Phone Number</p>
                      <p className="font-medium text-foreground">{selectedUser.phoneNumber || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Joined On</p>
                      <p className="font-medium text-foreground">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Activity */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Platform Activity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/30 p-4 rounded-xl border border-border flex flex-col justify-center shadow-inner">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Orders</p>
                    <p className="text-xl font-black text-foreground">{selectedUser.customerProfile?.totalOrders || 0}</p>
                  </div>
                  <div className="bg-secondary/30 p-4 rounded-xl border border-border flex flex-col justify-center shadow-inner">
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Deliveries</p>
                    <p className="text-xl font-black text-foreground">{selectedUser.delivererProfile?.totalDeliveries || 0}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Admin Actions */}
            <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mb-2">Administrative Actions</h3>
              
              {selectedUser.status === "ACTIVE" ? (
                <button
                  disabled={toggleMutation.isPending}
                  onClick={() => handleStatusChange("BANNED")}
                  className="w-full bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Ban size={18} />
                  Suspend User Account
                </button>
              ) : (
                <button
                  disabled={toggleMutation.isPending}
                  onClick={() => handleStatusChange("ACTIVE")}
                  className="w-full bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  Reactivate Account
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
