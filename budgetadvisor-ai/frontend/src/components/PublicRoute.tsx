import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

/**
 * Wraps public-only pages (landing, login, register).
 * Redirects authenticated users to their appropriate dashboard.
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Loading…" />;
  }

  if (isAuthenticated && user) {
    const destination = user.is_admin || user.is_superuser ? "/admin" : "/dashboard";
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
}
