import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Minus, Plus } from "lucide-react";
import { europeanCountries, currencies } from "@/data/dummy-data";
import { register } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/api/errors";
import { ErrorAlert } from "@/components/ErrorAlert";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Button } from "@/components/ui/button";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [householdSize, setHouseholdSize] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    country_code: "GB",
    preferred_currency: "GBP",
    monthly_budget: 500,
  });

  function set(field: keyof typeof form, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({ email: form.email, password: form.password, full_name: form.full_name || undefined });
      const me = await login(form.email, form.password);
      const isAdminUser = me.is_admin || me.is_superuser;
      navigate(isAdminUser ? "/admin" : "/dashboard");
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Registration failed. Please check your details and try again."));
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-semibold tracking-tight text-[#1a1a1a] flex items-center justify-center">
              <span className="text-black text-3xl mr-2">💰</span> budgetadvisor.ai
            </Link>
            <p className="text-base text-gray-500 mt-3">Create your account</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white shadow-2xl border border-gray-100 p-10 space-y-6 rounded-[2.5rem]">
            <ErrorAlert message={error} />
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <input type="text" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Sarah Mitchell" className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="sarah@email.com" className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Country</label>
              <select title="Country" value={form.country_code} onChange={(e) => set("country_code", e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                {europeanCountries.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Preferred Currency</label>
              <select title="Preferred Currency" value={form.preferred_currency} onChange={(e) => set("preferred_currency", e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                {currencies.map((c) => (<option key={c.code} value={c.code}>{c.symbol} {c.label}</option>))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Monthly Grocery Budget</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                <input type="number" title="Monthly Grocery Budget" min={0} value={form.monthly_budget} onChange={(e) => set("monthly_budget", Number(e.target.value))} className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring tabular" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Household Size</label>
              <div className="flex items-center gap-4">
                <button type="button" title="Decrease household size" onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))} className="size-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="size-4" />
                </button>
                <span className="text-lg font-semibold tabular w-8 text-center">{householdSize}</span>
                <button type="button" title="Increase household size" onClick={() => setHouseholdSize(Math.min(8, householdSize + 1))} className="size-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="size-4" />
                </button>
                <span className="text-sm text-muted-foreground">people</span>
              </div>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating account…" : "Create Account"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline font-medium">Log In</Link>
            </p>
          </form>
        </div>
      </div>
      <GlobalFooter />
    </div>
  );
}
