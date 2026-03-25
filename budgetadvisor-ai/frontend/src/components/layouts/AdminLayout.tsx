import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Settings,
  UserCircle2,
  LogOut,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const sidebarItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Processing Logs", path: "/admin/logs", icon: FileText },
  { label: "Categories", path: "/admin/categories", icon: Tag },
  { label: "System Settings", path: "/admin/settings", icon: Settings },
  { label: "Profile", path: "/admin/profile", icon: UserCircle2 },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const navLinks = (
    <nav className="flex-1 px-3 space-y-0.5">
      {sidebarItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
            {active && <ChevronRight className="size-4 ml-auto" />}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarHeader = (
    <div className="p-6">
      <Link
        to="/admin"
        onClick={() => setMobileOpen(false)}
        className="text-xl font-semibold text-sidebar-primary-foreground tracking-tight"
      >
        <span className="text-accent">•</span> budgetadvisor.ai{" "}
        <span className="text-xs font-normal text-sidebar-foreground/40 ml-1">Admin</span>
      </Link>
    </div>
  );

  const sidebarFooter = (
    <div className="p-4 border-t border-sidebar-border">
      <p className="text-xs text-sidebar-foreground/50">{user?.email ?? "Admin Panel"}</p>
      <Button
        variant="ghost"
        onClick={() => { handleLogout(); setMobileOpen(false); }}
        className="mt-3 w-full justify-center text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
      >
        <LogOut className="size-4" />
        Logout
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground">
        {sidebarHeader}
        {navLinks}
        {sidebarFooter}
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background">
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground">
                <div className="flex flex-col h-full">
                  {sidebarHeader}
                  {navLinks}
                  {sidebarFooter}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
