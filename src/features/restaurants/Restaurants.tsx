import { useState } from "react";
import { Plus, Search, MapPin, Loader2, Filter, X, Store, Edit, ChevronRight, Activity, Clock, Phone, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { PaginationBar } from "../../components/ui";
import { RestaurantFormModal } from "./RestaurantFormModal";

const ITEMS_PER_PAGE = 20;

export function Restaurants() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: restaurantsData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.restaurants.list({ page: currentPage, search: searchQuery, isOpen: statusFilter }),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "ALL") params.append("isOpen", statusFilter === "OPEN" ? "true" : "false");
      const res = await api.get(`/v1/restaurants?${params.toString()}`);
      return res.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isOpen }: { id: string; isOpen: boolean }) =>
      api.patch(`/v1/restaurants/${id}/status`, { isOpen }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restaurants.all });
      if (selectedRestaurant && selectedRestaurant.id === variables.id) {
        setSelectedRestaurant({ ...selectedRestaurant, isOpen: variables.isOpen });
      }
    },
  });

  const restaurants = restaurantsData?.restaurants || [];
  const totalRestaurants = restaurantsData?.total || 0;
  const totalPages = Math.ceil(totalRestaurants / ITEMS_PER_PAGE);

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Restaurants Management</h1>
          <p className="text-muted-foreground font-medium">Total of {totalRestaurants} restaurants managed</p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-3 rounded-2xl transition-all shadow-lg font-bold"
        >
          <Plus size={20} />
          Add Restaurant
        </button>
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
            placeholder="Search restaurants by name or location..."
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
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto px-4 py-3 bg-secondary/50 border border-border/50 rounded-xl text-foreground focus:ring-2 focus:ring-primary/50 outline-none appearance-none min-w-[160px]"
            style={selectBg}
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase animate-pulse">
              Loading restaurants...
            </p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-secondary/10 rounded-2xl border border-border">
            <Store className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-foreground text-lg font-bold">No Restaurants Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant: any) => (
              <div 
                key={restaurant.id}
                onClick={() => setSelectedRestaurant(restaurant)}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="h-32 bg-secondary relative overflow-hidden">
                  {restaurant.imageUrl ? (
                    <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                      <Store className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${
                      restaurant.isOpen 
                        ? "bg-green-500/90 text-white border border-green-400" 
                        : "bg-destructive/90 text-white border border-destructive/50"
                    }`}>
                      {restaurant.isOpen ? "OPEN" : "CLOSED"}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-foreground text-lg mb-1 truncate">{restaurant.name}</h3>
                  <div className="flex items-start gap-1.5 text-muted-foreground mt-2">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    <p className="text-sm line-clamp-2">{restaurant.location}</p>
                  </div>
                  
                  <div className="mt-auto pt-5 flex items-center justify-between border-t border-border/50">
                    <span className="text-[10px] font-black tracking-wider uppercase text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      {restaurant.mode === "ADMIN_MANAGED" ? "Platform Managed" : "Vendor Managed"}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="p-4 bg-secondary/10 rounded-2xl border border-border">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            total={totalRestaurants}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Centered Modal for Restaurant Details */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 transition-opacity">
          <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl p-6 flex flex-col max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Restaurant Overview</h2>
              <button onClick={() => setSelectedRestaurant(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              
              {/* Header Image & Status */}
              <div className="relative h-48 rounded-2xl overflow-hidden bg-secondary border border-border shadow-inner">
                {selectedRestaurant.imageUrl ? (
                  <img src={selectedRestaurant.imageUrl} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                    <Store className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-black text-white truncate drop-shadow-md">{selectedRestaurant.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      selectedRestaurant.isOpen ? "bg-green-500 text-white" : "bg-destructive text-white"
                    }`}>
                      {selectedRestaurant.isOpen ? "OPEN NOW" : "CLOSED"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/20">
                      {selectedRestaurant.mode === "ADMIN_MANAGED" ? "Platform Managed" : "Vendor Managed"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Business Details</h3>
                <div className="space-y-4 bg-secondary/30 p-5 rounded-xl border border-border shadow-inner">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Location</p>
                      <p className="font-medium text-foreground">{selectedRestaurant.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Phone</p>
                      <p className="font-medium text-foreground">{selectedRestaurant.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Admin Actions */}
            <div className="mt-6 pt-6 border-t border-border flex flex-col gap-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mb-2">Administrative Actions</h3>
              
              <button
                disabled={toggleMutation.isPending}
                onClick={() => toggleMutation.mutate({ id: selectedRestaurant.id, isOpen: !selectedRestaurant.isOpen })}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                  selectedRestaurant.isOpen 
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                    : "bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                }`}
              >
                <Activity size={18} />
                {selectedRestaurant.isOpen ? "Force Close Restaurant" : "Force Open Restaurant"}
              </button>

              <button
                onClick={() => {
                  setShowFormModal(true);
                  // Optional: Keep details open under it or close it. We'll close details for a cleaner flow.
                  // setSelectedRestaurant(null); 
                  // Wait, actually we can just leave it or set it to null. Let's just set it to null.
                }}
                className="w-full bg-secondary/50 text-foreground hover:bg-primary/20 hover:text-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Edit size={18} />
                Edit Restaurant Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Form Modal for Add/Edit */}
      {showFormModal && (
        <RestaurantFormModal 
          restaurant={selectedRestaurant} 
          onClose={() => {
            setShowFormModal(false);
            setSelectedRestaurant(null); // Clear selected so if they click edit again it's fresh
          }} 
        />
      )}
    </div>
  );
}
