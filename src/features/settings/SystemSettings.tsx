import { useState } from "react";
import { Settings, Shield, Bell, Key, Save, Loader2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/v1/settings").then(res => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch("/v1/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
          Loading Settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">System Settings</h1>
          <p className="text-muted-foreground">Manage platform configurations and preferences</p>
        </div>
        <button
          onClick={() => updateMutation.mutate({})}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-xl transition-all shadow-lg"
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 space-y-2">
          {[
            { id: "general", icon: Settings, label: "General" },
            { id: "security", icon: Shield, label: "Security" },
            { id: "notifications", icon: Bell, label: "Notifications" },
            { id: "api", icon: Key, label: "API Keys" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 admin-card p-8">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-foreground mb-6 capitalize">{activeTab} Settings</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-secondary/30 border border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Configuration options for {activeTab} will be loaded here from the backend engine.
                </p>
                <div className="flex items-center gap-3 text-sm font-medium text-amber-500 bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                  <AlertCircle size={18} />
                  Module under active construction
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
