import { useState } from "react";
import { CheckCircle, XCircle, Search, Loader2, X, User, Mail, Phone, CreditCard, FileText, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { PaginationBar } from "../../components/ui";

const ITEMS_PER_PAGE = 20;

export function VerificationCenter() {
  const [activeTab, setActiveTab] = useState<"deliverers" | "vendors">("deliverers");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: activeTab === "deliverers" 
      ? QUERY_KEYS.verifications.deliverers({ page: currentPage })
      : QUERY_KEYS.verifications.vendors({ page: currentPage }),
    queryFn: () => activeTab === "deliverers"
      ? adminService.getDelivererApplications({ page: currentPage, limit: ITEMS_PER_PAGE })
      : adminService.getVendorApplications({ page: currentPage, limit: ITEMS_PER_PAGE }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, role, status }: { id: string, role: any, status: string }) => 
      adminService.reviewVerification(id, role, { status, reason: "Admin Review" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.verifications.all });
      setSelectedApp(null);
    }
  });

  const applications = (applicationsData as any)?.applications || [];
  const totalItems = (applicationsData as any)?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handleReview = (status: "APPROVED" | "REJECTED") => {
    if (!selectedApp) return;
    // The backend expects userId, not the profile id
    const targetUserId = selectedApp.userId || selectedApp.user?.id;
    const role = activeTab === "deliverers" ? "DELIVERER" : "VENDOR_STAFF";
    reviewMutation.mutate({ id: targetUserId, role, status });
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Verification Center</h1>
          <p className="text-muted-foreground font-medium">Review pending fleet and merchant applications</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => { setActiveTab("deliverers"); setCurrentPage(1); setSelectedApp(null); }}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${
            activeTab === "deliverers" 
              ? "bg-primary text-primary-foreground shadow-lg" 
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          Fleet Applications
        </button>
        <button
          onClick={() => { setActiveTab("vendors"); setCurrentPage(1); setSelectedApp(null); }}
          className={`px-6 py-2 rounded-xl font-bold transition-all ${
            activeTab === "vendors" 
              ? "bg-primary text-primary-foreground shadow-lg" 
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          Merchant Applications
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Applicant</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Email</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Phone</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No pending applications found in this queue.
                  </td>
                </tr>
              ) : (
                applications.map((app: any) => (
                  <tr 
                    key={app.id} 
                    onClick={() => setSelectedApp(app)}
                    className="hover:bg-secondary/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-foreground font-bold">{app.user?.fullName || "N/A"}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{app.user?.email || app.user?.astuEmail || "N/A"}</td>
                    <td className="px-6 py-4 text-muted-foreground text-sm">{app.user?.phoneNumber || "N/A"}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-primary bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="p-4 border-t border-border bg-secondary/30">
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              total={totalItems}
              pageSize={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Side Panel for Application Details */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md h-full bg-card border-l border-border shadow-2xl p-6 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Application Details</h2>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Applicant Profile</h3>
                <div className="space-y-4 bg-secondary/30 p-5 rounded-xl border border-border shadow-inner">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Full Name</p>
                      <p className="font-medium text-foreground">{selectedApp.user?.fullName || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Email Address</p>
                      <p className="font-medium text-foreground">{selectedApp.user?.email || selectedApp.user?.astuEmail || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Phone Number</p>
                      <p className="font-medium text-foreground">{selectedApp.user?.phoneNumber || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {activeTab === "deliverers" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Payout Information</h3>
                  <div className="space-y-4 bg-secondary/30 p-5 rounded-xl border border-border shadow-inner">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Provider</p>
                        <p className="font-medium text-foreground uppercase">{selectedApp.payoutProvider || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Account Number</p>
                        <p className="font-bold text-foreground font-mono tracking-wide">{selectedApp.payoutAccount || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "vendors" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Business Credentials</h3>
                  <div className="space-y-4 bg-secondary/30 p-5 rounded-xl border border-border shadow-inner">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                      <div>
                        <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Attached Document</p>
                        {selectedApp.businessDocumentUrl ? (
                          <a 
                            href={selectedApp.businessDocumentUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-lg transition-colors text-sm font-bold"
                          >
                            Open Document
                          </a>
                        ) : (
                          <p className="text-sm text-foreground italic">No documentation provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-border flex gap-3">
              <button
                disabled={reviewMutation.isPending}
                onClick={() => handleReview("APPROVED")}
                className="flex-1 bg-green-500/20 hover:bg-green-500 text-green-500 hover:text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <CheckCircle size={18} />
                Approve
              </button>
              <button
                disabled={reviewMutation.isPending}
                onClick={() => handleReview("REJECTED")}
                className="flex-1 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <XCircle size={18} />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
