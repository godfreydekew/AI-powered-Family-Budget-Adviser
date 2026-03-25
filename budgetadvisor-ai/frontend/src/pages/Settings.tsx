import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { europeanCountries, currencies, categoryBreakdown } from "@/data/dummy-data";
import { useTheme } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { updateMe, updatePassword, deleteAccount } from "@/api/users";
import { getApiErrorMessage } from "@/api/errors";
import { ErrorAlert } from "@/components/ErrorAlert";
import { SuccessAlert } from "@/components/SuccessAlert";
import { Button } from "@/components/ui/button";

const sections = ["Profile", "Budget & Goals", "Preferences", "Account"] as const;

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<typeof sections[number]>("Profile");

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [countryCode, setCountryCode] = useState(user?.country_code ?? "GB");
  const [householdSize, setHouseholdSize] = useState(user?.household_size ?? 1);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthly_budget ?? 500);
  const [budgetStatus, setBudgetStatus] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);

  const [currency, setCurrency] = useState(user?.preferred_currency ?? "GBP");
  const [prefStatus, setPrefStatus] = useState<string | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [prefLoading, setPrefLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? "");
      setEmail(user.email);
      setCountryCode(user.country_code);
      setHouseholdSize(user.household_size);
      setMonthlyBudget(user.monthly_budget ?? 500);
      setCurrency(user.preferred_currency);
    }
  }, [user]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true); setProfileStatus(null); setProfileError(null);
    try {
      await updateMe({ full_name: fullName, email, country_code: countryCode, household_size: householdSize });
      await refreshUser();
      setProfileStatus("Profile saved successfully.");
    } catch (err) { setProfileError(getApiErrorMessage(err, "Unable to save profile.")); }
    finally { setProfileLoading(false); }
  }

  async function handleSaveBudget(e: React.FormEvent) {
    e.preventDefault();
    setBudgetLoading(true); setBudgetStatus(null); setBudgetError(null);
    try {
      await updateMe({ monthly_budget: monthlyBudget });
      await refreshUser();
      setBudgetStatus("Budget saved successfully.");
    } catch (err) { setBudgetError(getApiErrorMessage(err, "Unable to save budget.")); }
    finally { setBudgetLoading(false); }
  }

  async function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    setPrefLoading(true); setPrefStatus(null); setPrefError(null);
    try {
      await updateMe({ preferred_currency: currency });
      await refreshUser();
      setPrefStatus("Preferences saved successfully.");
    } catch (err) { setPrefError(getApiErrorMessage(err, "Unable to save preferences.")); }
    finally { setPrefLoading(false); }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null); setPasswordStatus(null); setPasswordLoading(true);
    try {
      await updatePassword({ current_password: currentPassword, new_password: newPassword });
      setPasswordStatus("Password updated successfully.");
      setCurrentPassword(""); setNewPassword("");
    } catch (err) { setPasswordError(getApiErrorMessage(err, "Unable to update password.")); }
    finally { setPasswordLoading(false); }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (deleteConfirm !== "DELETE") return;
    setDeleteError(null); setDeleteLoading(true);
    try {
      await deleteAccount();
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Unable to delete account."));
      setDeleteLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-secondary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Nav — horizontal scroll on mobile, vertical on desktop */}
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {sections.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActiveSection(s)}
                className={`whitespace-nowrap text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === s
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {s}
              </button>
            ))}
          </nav>

          <div className="lg:col-span-3 glass-card p-6 space-y-6">
            {activeSection === "Profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <h2 className="text-base font-semibold">Profile</h2>
                <ErrorAlert message={profileError} />
                <SuccessAlert message={profileStatus} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                    <input title="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <input title="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Country</label>
                    <select title="Country" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={`${inputClass} appearance-none`}>
                      {europeanCountries.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Household Size</label>
                    <div className="flex items-center gap-3">
                      <button type="button" title="Decrease" onClick={() => setHouseholdSize(Math.max(1, householdSize - 1))} className="size-10 rounded-lg bg-secondary flex items-center justify-center"><Minus className="size-4" /></button>
                      <span className="text-lg font-semibold tabular w-8 text-center">{householdSize}</span>
                      <button type="button" title="Increase" onClick={() => setHouseholdSize(Math.min(8, householdSize + 1))} className="size-10 rounded-lg bg-secondary flex items-center justify-center"><Plus className="size-4" /></button>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading ? "Saving…" : "Save Changes"}
                </Button>
              </form>
            )}

            {activeSection === "Budget & Goals" && (
              <form onSubmit={handleSaveBudget} className="space-y-6">
                <h2 className="text-base font-semibold">Budget & Goals</h2>
                <ErrorAlert message={budgetError} />
                <SuccessAlert message={budgetStatus} />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Monthly Budget</label>
                  <div className="relative w-48">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                    <input type="number" title="Monthly Budget" min={0} value={monthlyBudget} onChange={(e) => setMonthlyBudget(Number(e.target.value))} className={`${inputClass} pl-8 w-full tabular`} />
                  </div>
                </div>
                <h3 className="font-medium text-sm mt-6">Per-Category Targets (optional)</h3>
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  {categoryBreakdown.map((c) => (
                    <div key={c.key} className="flex items-center gap-3">
                      <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-sm flex-1">{c.label}</span>
                      <div className="relative w-24">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
                        <input type="number" title={`${c.label} budget`} className="w-full pl-7 pr-2 py-1.5 rounded-lg bg-secondary border-0 text-sm tabular focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                  ))}
                </div>
                <Button type="submit" disabled={budgetLoading}>
                  {budgetLoading ? "Saving…" : "Save Budget"}
                </Button>
              </form>
            )}

            {activeSection === "Preferences" && (
              <form onSubmit={handleSavePreferences} className="space-y-4">
                <h2 className="text-base font-semibold">Preferences</h2>
                <ErrorAlert message={prefError} />
                <SuccessAlert message={prefStatus} />
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Currency</label>
                  <select title="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className={`${inputClass} w-48 appearance-none`}>
                    {currencies.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Appearance</label>
                  <div className="flex gap-2">
                    {(["light", "dark"] as const).map((t) => (
                      <Button key={t} type="button" variant={theme === t ? "default" : "secondary"} onClick={() => setTheme(t)} className="capitalize">
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={prefLoading}>
                  {prefLoading ? "Saving…" : "Save Preferences"}
                </Button>
              </form>
            )}

            {activeSection === "Account" && (
              <div className="space-y-8">
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <h2 className="text-base font-semibold">Change Password</h2>
                  <ErrorAlert message={passwordError} />
                  <SuccessAlert message={passwordStatus} />
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                    <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={`${inputClass} max-w-sm`} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">New Password</label>
                    <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${inputClass} max-w-sm`} />
                  </div>
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? "Updating…" : "Update Password"}
                  </Button>
                </form>

                <form onSubmit={handleDeleteAccount} className="p-6 rounded-2xl border-2 border-destructive/20 space-y-3">
                  <h3 className="font-semibold text-destructive">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">This action is irreversible. All your receipts and data will be permanently deleted.</p>
                  <input title='Type DELETE to confirm' placeholder='Type "DELETE" to confirm' value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className={`${inputClass} max-w-sm focus:ring-destructive`} />
                  <ErrorAlert message={deleteError} />
                  <Button type="submit" variant="destructive" disabled={deleteConfirm !== "DELETE" || deleteLoading}>
                    {deleteLoading ? "Deleting…" : "Delete My Account"}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
