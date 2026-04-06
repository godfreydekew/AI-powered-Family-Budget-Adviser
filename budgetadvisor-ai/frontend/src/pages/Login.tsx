import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { requestPasswordReset } from "@/api/auth";
import { getApiErrorMessage } from "@/api/errors";
import { ErrorAlert } from "@/components/ErrorAlert";
import { SuccessAlert } from "@/components/SuccessAlert";
import { GlobalFooter } from "@/components/GlobalFooter";
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
      <div className="min-h-screen bg-gradient-to-b from-[#F5F6FE] to-white flex flex-col">
        <header className="sticky top-0 z-30 bg-transparent border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/" className="text-xl font-semibold tracking-tight text-[#1a1a1a] flex items-center">
              <span className="text-black text-2xl mr-2">💰</span> budgetadvisor.ai
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/" className="text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors px-3 py-2">Home</Link>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Link to="/" className="text-3xl font-semibold tracking-tight text-[#1a1a1a] flex items-center justify-center">
                <span className="text-black text-3xl mr-2">💰</span> budgetadvisor.ai
              </Link>
              <p className="text-base text-gray-500 mt-3">Reset your password</p>
            </div>
            <div className="bg-white shadow-2xl border border-gray-100 p-10 space-y-8 rounded-[2.5rem]">
              {forgotSent ? (
                <SuccessAlert message="If that email is registered, we've sent a reset link. Check your inbox." />
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <ErrorAlert message={forgotError} />
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="sarah@email.com" className="w-full px-5 py-3 rounded-xl bg-[#F5F6FE] border-0 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A297FF]" />
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
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F6FE] to-white flex flex-col">
      <header className="sticky top-0 z-30 bg-transparent border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-tight text-[#1a1a1a] flex items-center">
            <span className="text-black text-2xl mr-2">💰</span> budgetadvisor.ai
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors px-3 py-2">Home</Link>
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-semibold tracking-tight text-[#1a1a1a] flex items-center justify-center">
              <span className="text-black text-3xl mr-2">💰</span> budgetadvisor.ai
            </Link>
            <p className="text-base text-gray-500 mt-3">Welcome back</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white shadow-2xl border border-gray-100 p-10 space-y-8 rounded-[2.5rem]">
            <ErrorAlert message={error} />
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@email.com" className="w-full px-5 py-3 rounded-xl bg-[#F5F6FE] border-0 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A297FF]" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-3 rounded-xl bg-[#F5F6FE] border-0 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A297FF] pr-10" />
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
      <GlobalFooter />
    </div>
  );
}
