import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { resetPassword } from "@/api/auth";
import { getApiErrorMessage } from "@/api/errors";
import { ErrorAlert } from "@/components/ErrorAlert";
import { SuccessAlert } from "@/components/SuccessAlert";
import { GlobalFooter } from "@/components/GlobalFooter";
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
      <div className="min-h-screen bg-gradient-to-b from-[#F5F6FE] to-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <Logo subtitle="Reset your password" />
            <div className="bg-white shadow-2xl border border-gray-100 p-10 text-center space-y-4 rounded-[2.5rem]">
              <p className="text-sm text-muted-foreground">
                This reset link is invalid or has expired.
              </p>
              <Link to="/login" className="inline-block text-sm text-accent hover:underline font-medium">
                Back to login
              </Link>
            </div>
          </div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F6FE] to-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <Logo subtitle="Reset your password" />
            <div className="bg-white shadow-2xl border border-gray-100 p-10 space-y-5 rounded-[2.5rem]">
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
        <GlobalFooter />
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
    <div className="min-h-screen bg-gradient-to-b from-[#F5F6FE] to-white flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Logo subtitle="Choose a new password" />
          <form onSubmit={handleSubmit} className="bg-white shadow-2xl border border-gray-100 p-10 space-y-6 rounded-[2.5rem]">
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
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F6FE] border-0 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A297FF] pr-10"
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
                    className="w-full px-5 py-3 rounded-xl bg-[#F5F6FE] border-0 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A297FF] pr-10"
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
      <GlobalFooter />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 bg-transparent border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold tracking-tight text-[#1a1a1a] flex items-center">
          <span className="text-black text-2xl mr-2">💰</span> budgetadvisor.ai
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors px-3 py-2"
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
      <Link to="/" className="text-3xl font-semibold tracking-tight text-[#1a1a1a] flex items-center justify-center">
        <span className="text-black text-3xl mr-2">💰</span> budgetadvisor.ai
      </Link>
      <p className="text-base text-gray-500 mt-3">{subtitle}</p>
    </div>
  );
}
