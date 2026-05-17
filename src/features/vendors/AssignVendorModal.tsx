import { useState } from "react";
import {
  Building,
  UserPlus,
  X,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { QUERY_KEYS } from "../../constants/queryKeys";

interface AssignVendorModalProps {
  onClose: () => void;
}

export function AssignVendorModal({ onClose }: AssignVendorModalProps) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { data: vendorStaffData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["vendorStaffUsers"],
    queryFn: async () => {
      const res = await api.get("/v1/users?role=VENDOR_STAFF&limit=100");
      return res.data;
    },
  });

  const { data: restaurantsData } = useQuery({
    queryKey: QUERY_KEYS.restaurants.list({}),
    queryFn: async () => {
      const res = await api.get("/v1/restaurants");
      return res.data;
    },
  });

  const assignMutation = useMutation({
    mutationFn: (data: {
      userId: string;
      restaurantId: string;
      isOwner: boolean;
    }) => api.post("/v1/users/assign-vendor", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendors.all });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(
        err.response?.data?.message || "Failed to assign vendor staff",
      );
    },
  });

  const selectClass =
    "w-full px-4 py-3.5 bg-background border border-border/50 rounded-2xl text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none";
  const selectBg = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
    backgroundSize: "1.2rem",
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="admin-card w-full max-w-xl shadow-2xl backdrop-blur-xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-secondary/20 rounded-t-[0.75rem]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-xl">
              <Building className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground">Assign Staff</h2>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                Link User to Merchant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            assignMutation.mutate({
              userId: selectedUserId,
              restaurantId: selectedRestaurantId,
              isOwner,
            });
          }}
          className="p-8 space-y-6"
        >
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* User Selector */}
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                Select Merchant Staff
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className={selectClass}
                style={selectBg}
              >
                <option value="">{isLoadingUsers ? "Loading staff..." : "Select a vendor staff member..."}</option>
                {vendorStaffData?.users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.astuEmail || user.email || user.phoneNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Restaurant Selector */}
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                Assign to Restaurant
              </label>
              <select
                value={selectedRestaurantId}
                onChange={(e) => setSelectedRestaurantId(e.target.value)}
                required
                className={selectClass}
                style={selectBg}
              >
                <option value="">Select a restaurant...</option>
                {restaurantsData?.restaurants?.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner Toggle */}
            <div
              className="flex items-center gap-3 p-4 bg-secondary/50 rounded-2xl border border-border/50 cursor-pointer group transition-colors hover:bg-secondary"
              onClick={() => setIsOwner(!isOwner)}
            >
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${isOwner ? "bg-primary border-primary" : "border-muted-foreground group-hover:border-foreground"}`}
              >
                {isOwner && <Check size={16} className="text-primary-foreground" />}
              </div>
              <div>
                <p className="text-foreground font-bold text-sm">
                  Assign as Proprietor (Owner)
                </p>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                  Grants full management rights over restaurant profile
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-secondary text-muted-foreground hover:text-foreground font-bold rounded-2xl hover:bg-secondary/80 transition-all active:scale-95"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={assignMutation.isPending}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {assignMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <UserPlus size={20} />
              )}
              Complete Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
