import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { requestPasswordReset } from "@/api/auth";
import { getApiErrorMessage } from "@/api/errors";
import { ErrorAlert } from "@/components/ErrorAlert";
import { SuccessAlert } from "@/components/SuccessAlert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const from = (location.state as { from?: string })?.from || "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const me = await login(email, password);
      const isAdminUser = me.is_admin || me.is_superuser;
      const destination = isAdminUser ? "/admin" : from;
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Incorrect email or password. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    try {
      await requestPasswordReset(forgotEmail);
      setForgotSent(true);
    } catch (err: unknown) {
      setForgotError(getApiErrorMessage(err, "Unable to send reset email. Please try again."));
    } finally {
      setForgotLoading(false);
    }
  }

  if (showForgot) {
    return (
      <div className="min-h-screen hero-gradient flex flex-col">
        <header className="sticky top-0 z-30 glass-nav border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold tracking-tight">
              <span className="text-accent">•</span> budgetadvisor.ai
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Home</Link>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link to="/" className="text-2xl font-semibold tracking-tight">
                <span className="text-accent">•</span> budgetadvisor.ai
              </Link>
              <p className="text-sm text-muted-foreground mt-2">Reset your password</p>
            </div>
            <div className="glass-card p-8 space-y-6">
              {forgotSent ? (
                <SuccessAlert message="If that email is registered, we've sent a reset link. Check your inbox." />
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <ErrorAlert message={forgotError} />
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="sarah@email.com" className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <Button type="submit" disabled={forgotLoading} className="w-full">
                    {forgotLoading ? "Sending…" : "Send Reset Link"}
                  </Button>
                </form>
              )}
              <button type="button" onClick={() => { setShowForgot(false); setForgotSent(false); setForgotError(null); }} className="w-full text-sm text-center text-accent hover:underline">
                Back to login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient flex flex-col">
      <header className="sticky top-0 z-30 glass-nav border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            <span className="text-accent">•</span> budgetadvisor.ai
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">Home</Link>
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-semibold tracking-tight">
              <span className="text-accent">•</span> budgetadvisor.ai
            </Link>
            <p className="text-sm text-muted-foreground mt-2">Welcome back</p>
          </div>
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            <ErrorAlert message={error} />
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@email.com" className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-accent hover:underline">
                Forgot password?
              </button>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Signing in…" : "Sign In"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-accent hover:underline font-medium">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
