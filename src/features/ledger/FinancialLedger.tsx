import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/adminService";
import { QUERY_KEYS } from "../../constants/queryKeys";
import { PaginationBar, StatCard } from "../../components/ui";

const ITEMS_PER_PAGE = 20;

export function FinancialLedger() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: ledgerData, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.ledger.list({ page: currentPage }),
    queryFn: () => adminService.getLedgerTransactions({ page: currentPage, limit: ITEMS_PER_PAGE }),
  });

  const transactions = ledgerData?.transactions || [];
  const totalItems = ledgerData?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Financial Ledger</h1>
          <p className="text-muted-foreground font-medium">Track platform revenue, payouts, and escrow balances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Total Revenue"
          value="ETB 145,230.00"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Pending Payouts"
          value="ETB 34,100.00"
          icon={ArrowDownRight}
          color="orange"
        />
        <StatCard
          label="Escrow Balance"
          value="ETB 45,800.00"
          icon={DollarSign}
          color="blue"
        />
      </div>

      <div className="admin-card overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30">
          <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/50 border-b border-border">
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Transaction ID</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Type</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Amount</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Date</th>
                <th className="px-6 py-4 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-foreground font-medium">{tx.id}</p>
                      <p className="text-xs text-muted-foreground">{tx.orderId || "N/A"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`font-semibold ${tx.amount > 0 ? "text-green-500" : "text-destructive"}`}>
                        {tx.amount > 0 ? "+" : ""}ETB {Math.abs(tx.amount).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === "COMPLETED" ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500"
                      }`}>
                        {tx.status}
                      </span>
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
    </div>
  );
}
