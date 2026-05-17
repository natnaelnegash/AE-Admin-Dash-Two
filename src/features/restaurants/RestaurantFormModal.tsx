import { useState } from "react";
import { X, Loader2, Store, MapPin, Phone, UploadCloud, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { QUERY_KEYS } from "../../constants/queryKeys";

interface RestaurantFormModalProps {
  onClose: () => void;
  restaurant?: any; // If provided, we're in edit mode
}

export function RestaurantFormModal({ onClose, restaurant }: RestaurantFormModalProps) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: restaurant?.name || "",
      location: restaurant?.location || "",
      phone: restaurant?.phone || "",
      mode: restaurant?.mode || "ADMIN_MANAGED",
      lat: restaurant?.lat || 8.5412, // Default ASTU approx lat
      lng: restaurant?.lng || 39.2689, // Default ASTU approx lng
      openingTime: restaurant?.openingTime || "08:00",
      closingTime: restaurant?.closingTime || "22:00",
      imageUrl: restaurant?.imageUrl || "",
    }
  });

  const isEdit = !!restaurant;

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      // Ensure lat/lng are floats
      const payload = {
        ...data,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
      };
      
      if (isEdit) {
        return api.patch(`/v1/restaurants/${restaurant.id}`, payload);
      } else {
        return api.post('/v1/restaurants', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restaurants.all });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} restaurant.`);
    }
  });

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-border bg-secondary/30">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEdit ? "Edit Restaurant" : "Add New Restaurant"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isEdit ? "Update existing restaurant details" : "Register a new restaurant on the platform"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <form id="restaurant-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Restaurant Name</label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        {...register("name", { required: "Name is required" })}
                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                        placeholder="e.g. Student Lounge"
                      />
                    </div>
                    {errors.name && <p className="text-[10px] text-red-400">{errors.name.message as string}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        {...register("phone", { required: "Phone is required" })}
                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                        placeholder="e.g. 0911223344"
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] text-red-400">{errors.phone.message as string}</p>}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Location & Coordinates</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Location Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("location", { required: "Location is required" })}
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                      placeholder="e.g. ASTU Block 52, First Floor"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Latitude</label>
                    <input 
                      type="number" step="any"
                      {...register("lat", { required: true })}
                      className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Longitude</label>
                    <input 
                      type="number" step="any"
                      {...register("lng", { required: true })}
                      className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>

              {/* Operational details */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Operational Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Management Mode</label>
                    <select 
                      {...register("mode")}
                      className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                    >
                      <option value="ADMIN_MANAGED">Platform Managed</option>
                      <option value="VENDOR_MANAGED">Vendor Managed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Opening Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="time"
                        {...register("openingTime")}
                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Closing Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="time"
                        {...register("closingTime")}
                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">Media</h3>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Cover Image URL</label>
                  <div className="relative">
                    <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      {...register("imageUrl")}
                      className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" 
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>

        <div className="p-6 border-t border-border bg-secondary/30 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="restaurant-form"
            disabled={saveMutation.isPending}
            className="px-6 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Restaurant"}
          </button>
        </div>

      </div>
    </div>
  );
}
