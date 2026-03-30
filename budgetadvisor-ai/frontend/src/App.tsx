import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReceiptUpload from "./pages/ReceiptUpload";
import ReceiptsList from "./pages/ReceiptsList";
import ReceiptDetail from "./pages/ReceiptDetail";
import Analytics from "./pages/Analytics";
import AdvisorPage from "./pages/Advisor";
import AdvisorsPage from "./pages/Advisors";
import SettingsPage from "./pages/Settings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminBenefits from "./pages/admin/AdminBenefits";
import BenefitsPage from "./pages/Benefits";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public — redirects authenticated users */}
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Landing />
                  </PublicRoute>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />

              {/* Authenticated */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receipts/upload"
                element={
                  <ProtectedRoute>
                    <ReceiptUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receipts/:id"
                element={
                  <ProtectedRoute>
                    <ReceiptDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/receipts"
                element={
                  <ProtectedRoute>
                    <ReceiptsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisors"
                element={
                  <ProtectedRoute>
                    <AdvisorsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advisor"
                element={
                  <ProtectedRoute>
                    <AdvisorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/benefits"
                element={
                  <ProtectedRoute>
                    <BenefitsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/logs"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/benefits"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminBenefits />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
