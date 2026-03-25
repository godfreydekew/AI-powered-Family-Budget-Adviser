import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Admin Profile</h1>
        <div className="glass-card p-6 max-w-2xl space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Full Name</p>
              <p className="mt-1 text-sm font-medium">{user?.full_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
              <p className="mt-1 text-sm font-medium">{user?.email || "Not available"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
              <p className="mt-1 text-sm font-medium">
                {user?.is_superuser ? "Superuser" : user?.is_admin ? "Admin" : "User"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Account Status</p>
              <p className="mt-1 text-sm font-medium">{user?.is_active ? "Active" : "Inactive"}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
