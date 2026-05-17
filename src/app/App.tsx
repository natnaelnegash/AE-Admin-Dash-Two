import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./store";

// Layout
import { AdminLayout } from "../layout/AdminLayout";
import { ProtectedRoute } from "../layout/ProtectedRoute";

// Auth & Theme
import { AdminLogin } from "../features/auth/AdminLogin";
import { ThemeProvider } from "../features/theme/ThemeProvider";

// Pages
import { AnalyticsDashboard } from "../features/analytics/AnalyticsDashboard";
import { VerificationCenter } from "../features/verification/VerificationCenter";
import { OrdersDispatch } from "../features/orders/OrdersDispatch";
import { DisputeResolution } from "../features/disputes/DisputeResolution";
import { FinancialLedger } from "../features/ledger/FinancialLedger";
import { SystemSettings } from "../features/settings/SystemSettings";
import { Restaurants } from "../features/restaurants/Restaurants";
import { Vendors } from "../features/vendors/Vendors";
import { Users } from "../features/users/Users";
import { Deliverers } from "../features/deliverers/Deliverers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s — keeps data fresh without hammering the API
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ThemeProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<AdminLogin />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<AdminLayout />}>
                    <Route index element={<AnalyticsDashboard />} />
                    <Route path="verification" element={<VerificationCenter />} />
                    <Route path="orders" element={<OrdersDispatch />} />
                    <Route path="disputes" element={<DisputeResolution />} />
                    <Route path="ledger" element={<FinancialLedger />} />
                    <Route path="settings" element={<SystemSettings />} />
                    <Route path="restaurants" element={<Restaurants />} />
                    <Route path="vendors" element={<Vendors />} />
                    <Route path="users" element={<Users />} />
                    <Route path="deliverers" element={<Deliverers />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </Provider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
