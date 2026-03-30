import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { resetPassword } from "@/api/auth";
import { getApiErrorMessage } from "@/api/errors";
import { ErrorAlert } from "@/components/ErrorAlert";
import { SuccessAlert } from "@/components/SuccessAlert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen hero-gradient flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <Logo subtitle="Reset your password" />
            <div className="glass-card p-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                This reset link is invalid or has expired.
              </p>
              <Link to="/login" className="inline-block text-sm text-accent hover:underline font-medium">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen hero-gradient flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <Logo subtitle="Reset your password" />
            <div className="glass-card p-8 space-y-5">
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="size-14 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <ShieldCheck className="size-7 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">Password updated</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your password has been changed successfully.
                  </p>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate("/login", { replace: true })}>
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await resetPassword({ token, new_password: password });
      setSuccess(true);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to reset password. The link may have expired."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Logo subtitle="Choose a new password" />
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            <ErrorAlert message={error} />
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Updating…" : "Set new password"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Remembered it?{" "}
              <Link to="/login" className="text-accent hover:underline font-medium">
                Back to login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 glass-nav border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold tracking-tight">
          <span className="text-accent">•</span> budgetadvisor.ai
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}

function Logo({ subtitle }: { subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <Link to="/" className="text-2xl font-semibold tracking-tight">
        <span className="text-accent">•</span> budgetadvisor.ai
      </Link>
      <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
    </div>
  );
}
