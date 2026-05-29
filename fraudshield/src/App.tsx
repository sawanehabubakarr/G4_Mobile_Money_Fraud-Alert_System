import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Layouts
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AnalystLayout } from "@/components/layout/AnalystLayout";

// User Dashboard Pages
import UserDashboard from "./pages/dashboard/UserDashboard";
import UserAlerts from "./pages/dashboard/UserAlerts";
import UserTransactions from "./pages/dashboard/UserTransactions";
import UserSettings from "./pages/dashboard/UserSettings";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRules from "./pages/admin/AdminRules";
import AdminReports from "./pages/admin/AdminReports";

// Analyst Pages
import AnalystDashboard from "./pages/analyst/AnalystDashboard";
import AnalystAlerts from "./pages/analyst/AnalystAlerts";
import AnalystTransactions from "./pages/analyst/AnalystTransactions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />

              {/* User Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<UserDashboard />} />
                <Route path="alerts" element={<UserAlerts />} />
                <Route path="transactions" element={<UserTransactions />} />
                <Route path="settings" element={<UserSettings />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="rules" element={<AdminRules />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>

              {/* Analyst Routes */}
              <Route path="/analyst" element={<AnalystLayout />}>
                <Route index element={<AnalystDashboard />} />
                <Route path="alerts" element={<AnalystAlerts />} />
                <Route path="transactions" element={<AnalystTransactions />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;