import { useState } from "react";
import { CheckCircle, XCircle, Search, Loader2, AlertCircle, Eye, ShieldAlert, ArrowRight, Gavel } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { PaginationBar, StatusBadge } from "../../components/ui";

const ITEMS_PER_PAGE = 20;

export function DisputeResolution() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | "">("");
  
  const queryClient = useQueryClient();

  const { data: disputesData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.disputes.list({ page: currentPage, search: searchQuery }),
    queryFn: () => adminService.getDisputes({ page: currentPage, limit: ITEMS_PER_PAGE, status: searchQuery }),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => adminService.resolveDispute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.disputes.all });
      setSelectedDispute(null);
      setResolutionNote("");
      setRefundAmount("");
    }
  });

  const disputes = disputesData?.disputes || [];
  const totalDisputes = disputesData?.total || 0;
  const totalPages = Math.ceil(totalDisputes / ITEMS_PER_PAGE);

  const handleResolve = (action: string) => {
    if (!selectedDispute) return;
    resolveMutation.mutate({
      id: selectedDispute.id,
      payload: { 
        status: "RESOLVED",
        resolution: resolutionNote,
        action: action,
        amount: Number(refundAmount) || 0
      }
    });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dispute Resolution</h1>
          <p className="text-muted-foreground font-medium">Handle customer conflicts, driver issues, and refunds</p>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/30 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Order Details</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Filed By</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Issue Summary</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    Loading disputes...
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No active disputes found.
                  </td>
                </tr>
              ) : (
                disputes.map((dispute: any) => (
                  <tr key={dispute.id} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedDispute(dispute)}>
                    <td className="px-6 py-4">
                      <p className="text-foreground font-semibold">{dispute.orderId}</p>
                      <p className="text-xs text-muted-foreground">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground text-sm font-medium">{dispute.raisedByName || dispute.customerId}</p>
                      <p className="text-xs text-muted-foreground">{dispute.raisedById}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-muted-foreground text-sm max-w-xs truncate">
                        {dispute.reason || dispute.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={dispute.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDispute(dispute);
                        }}
                        className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-2"
                      >
                        <Gavel size={16} /> Review
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
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => !resolveMutation.isPending && setSelectedDispute(null)}
          ></div>
          <div className="admin-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-20">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Dispute Review</h2>
                <p className="text-muted-foreground text-sm mt-1">Order {selectedDispute.orderId}</p>
              </div>
              <button 
                onClick={() => setSelectedDispute(null)}
                className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Dispute Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Filed By</p>
                  <p className="text-foreground font-semibold">{selectedDispute.raisedByName || selectedDispute.customerId}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(selectedDispute.createdAt).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Current Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedDispute.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldAlert size={16} className="text-orange-500" />
                  Issue Description
                </h3>
                <div className="p-4 bg-background border border-border rounded-xl">
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {selectedDispute.reason || selectedDispute.description}
                  </p>
                </div>
              </div>

              {selectedDispute.evidence && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">Evidence Provided</h3>
                  <div className="flex gap-2">
                    <a 
                      href={selectedDispute.evidence} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Eye size={16} /> View Attached Evidence
                    </a>
                  </div>
                </div>
              )}

              {/* Resolution Controls */}
              {selectedDispute.status === "OPEN" || selectedDispute.status === "UNDER_REVIEW" ? (
                <div className="pt-6 border-t border-border space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Admin Resolution</h3>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Resolution Notes (Visible to parties)
                    </label>
                    <textarea
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Explain the decision..."
                      className="w-full h-24 p-3 bg-background border border-border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Amount (ETB) - Required for Refund / Release
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 250.50"
                      className="w-full p-3 bg-background border border-border text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      disabled={resolveMutation.isPending || !resolutionNote.trim()}
                      onClick={() => handleResolve("REFUND")}
                      className="flex-1 px-4 py-3 bg-green-500/10 text-green-500 hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-green-500/20"
                    >
                      {resolveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                      Refund Customer
                    </button>
                    <button
                      disabled={resolveMutation.isPending || !resolutionNote.trim()}
                      onClick={() => handleResolve("RELEASE")}
                      className="flex-1 px-4 py-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-blue-500/20"
                    >
                      {resolveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                      Release to Deliverer
                    </button>
                    <button
                      disabled={resolveMutation.isPending || !resolutionNote.trim()}
                      onClick={() => handleResolve("DISMISS")}
                      className="flex-1 px-4 py-3 bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border border-destructive/20"
                    >
                      {resolveMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
                      Dismiss
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Note: An admin resolution note must be provided before finalizing the dispute.
                  </p>
                </div>
              ) : (
                <div className="pt-6 border-t border-border space-y-4">
                  <h3 className="text-sm font-bold text-foreground">Resolution Details</h3>
                  <div className="p-4 bg-secondary/30 rounded-xl border border-border">
                    <p className="text-sm text-foreground">{selectedDispute.resolution || "No resolution notes provided."}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
