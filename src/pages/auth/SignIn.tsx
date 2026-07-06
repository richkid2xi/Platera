import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { staffMembers, allRoles } from "@/mocks/staff";
import ShutterImagePanel from "@/components/feature/ShutterImagePanel";

// ── Mock credentials panel ─────────────────────────────────────────
const MOCK_PASSWORD = "platera123";

const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
  Owner:                { bg: "bg-primary-50 dark:bg-primary-900/20",     text: "text-primary-600 dark:text-primary-400" },
  Manager:              { bg: "bg-accent-50 dark:bg-accent-900/20",       text: "text-accent-600 dark:text-accent-400" },
  Accountant:           { bg: "bg-blue-50 dark:bg-blue-900/20",           text: "text-blue-600 dark:text-blue-400" },
  "Kitchen Supervisor": { bg: "bg-orange-50 dark:bg-orange-900/20",       text: "text-orange-600 dark:text-orange-400" },
  Cook:                 { bg: "bg-yellow-50 dark:bg-yellow-900/20",       text: "text-yellow-700 dark:text-yellow-400" },
  Waitress:             { bg: "bg-pink-50 dark:bg-pink-900/20",           text: "text-pink-600 dark:text-pink-400" },
  Waiter:               { bg: "bg-indigo-50 dark:bg-indigo-900/20",       text: "text-indigo-600 dark:text-indigo-400" },
  Bartender:            { bg: "bg-teal-50 dark:bg-teal-900/20",           text: "text-teal-600 dark:text-teal-400" },
  Host:                 { bg: "bg-secondary-50 dark:bg-secondary-900/20", text: "text-secondary-600 dark:text-secondary-400" },
  Cleaner:              { bg: "bg-foreground-100 dark:bg-foreground-800", text: "text-foreground-600 dark:text-foreground-400" },
};

const MOCK_ACCOUNTS = staffMembers.filter((s) => s.status === "active" && s.role === "Owner");

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
function getRoleIcon(role: string) {
  return allRoles.find((r) => r.role === role)?.icon ?? "ri-user-line";
}

// ── Animated counter hook ──────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ── Stats shown on the hero panel ─────────────────────────────────
const STATS = [
  { label: "Restaurants", target: 2400, suffix: "+", icon: "ri-store-2-fill" },
  { label: "Avg rating", target: 49, suffix: "", display: (v: number) => `${(v / 10).toFixed(1)} ★`, icon: "ri-star-fill" },
  { label: "Orders / day", target: 18000, suffix: "+", icon: "ri-receipt-line" },
  { label: "Uptime", target: 99, suffix: "%", icon: "ri-flashlight-fill" },
];

function StatItem({ label, target, suffix, display, icon, animate }: {
  label: string; target: number; suffix: string; icon: string;
  display?: (v: number) => string; animate: boolean;
}) {
  const value = useCountUp(target, 1800, animate);
  const shown = display ? display(value) : `${value.toLocaleString()}${suffix}`;
  return (
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
        <i className={`${icon} text-primary-300 text-sm`} />
      </div>
      <div>
        <p className="text-lg font-black text-white font-heading tabular-nums leading-none">{shown}</p>
        <p className="text-xs text-white/50 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────

export default function SignIn() {
  const { signIn, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const stateError = (location.state as { error?: string })?.error;
  const [error, setError] = useState<string | null>(stateError || null);
  const [showMockPanel, setShowMockPanel] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";

  // Trigger count-up animation when the stats come into view
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const stateError = (location.state as { error?: string })?.error;
    const sessionError = sessionStorage.getItem('logoutReason');

    if (stateError) {
      setError(stateError);
      // Clear the state so it doesn't persist on reload
      navigate(location.pathname, { replace: true, state: {} });
    } else if (sessionError === 'timeout') {
      setError("Session expired, please log in again");
      sessionStorage.removeItem('logoutReason');
    }
  }, [location, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError("Please fill in all fields."); return; }
    try {
      setIsLoading(true);
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch {
      setError("Invalid email or password. Try a mock account below ↓");
      setShowMockPanel(true);
    } finally {
      setIsLoading(false);
    }
  }

  function quickLogin(memberEmail: string) {
    setEmail(memberEmail);
    setPassword(MOCK_PASSWORD);
    setError(null);
  }

  return (
    <div className="min-h-screen flex bg-background-50 dark:bg-foreground-950 font-body">
      {/* ══════════════════ LEFT PANEL — Shutter Animation ══════════════════ */}
      <ShutterImagePanel className="hidden lg:flex lg:w-[44%] xl:w-[46%]">
        <div className="flex flex-col h-full p-8 xl:p-10 gap-6">
          {/* Logo watermark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/favicon.png" alt="Platera Bowl" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-black text-white font-heading tracking-tight drop-shadow">
              Platera
            </span>
          </div>

          {/* Hero headline */}
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Restaurant Management System
            </div>
            <h2 className="text-3xl xl:text-4xl font-black text-white font-heading leading-[1.1]">
              Every great meal<br />
              starts with a{" "}
              <span className="text-primary-400">great system.</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              Manage orders, tables, staff and inventory in real-time — all from one beautiful dashboard.
            </p>

            <div ref={statsRef} className="pt-1 grid grid-cols-2 gap-x-6 gap-y-4">
              {STATS.map((s) => (
                <StatItem key={s.label} {...s} animate={statsVisible} />
              ))}
            </div>
          </div>

          {/* Bottom user avatars */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {["#FF6B35", "#22C55E", "#D946EF", "#3B82F6"].map((bg, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-foreground-950 flex items-center justify-center text-white text-xs font-bold font-heading shadow"
                  style={{ background: bg }}
                >
                  {["KO", "AS", "AB", "KM"][i]}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Trusted by your team</p>
              <p className="text-white/50 text-xs">10 staff members onboarded</p>
            </div>
          </div>
        </div>
      </ShutterImagePanel>

      {/* ══════════════════ RIGHT PANEL ══════════════════ */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 relative overflow-y-auto bg-white dark:bg-foreground-950">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl flex items-center justify-center text-foreground-500 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 transition-colors"
          aria-label="Toggle theme"
        >
          <i className={theme === "dark" ? "ri-sun-line text-lg" : "ri-moon-line text-lg"} />
        </button>

        <div className="w-full max-w-[390px] animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/favicon.png" alt="Platera Bowl" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black text-foreground-900 dark:text-foreground-100 font-heading">
              Platera
            </span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-0.5 rounded-full bg-primary-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">Sign in</span>
            </div>
            <h1 className="text-2xl font-black text-foreground-950 dark:text-foreground-50 font-heading tracking-tight mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-foreground-500 dark:text-foreground-400">
              Sign in to your restaurant dashboard
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm mb-6 animate-fade-in">
              <i className="ri-error-warning-line shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" id="sign-in-form" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signin-email" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500">
                  <i className="ri-mail-line text-base" />
                </span>
                <input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@platera.app"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 dark:placeholder:text-foreground-600 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="signin-password" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500">
                  <i className="ri-lock-line text-base" />
                </span>
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 dark:placeholder:text-foreground-600 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500 hover:text-foreground-600 dark:hover:text-foreground-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={showPassword ? "ri-eye-off-line text-base" : "ri-eye-line text-base"} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="signin-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 hover-lift"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <i className="ri-login-circle-line" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* ── Mock credentials panel ── */}
          <div className="mt-6 rounded-2xl border border-dashed border-primary-200 dark:border-primary-800/60 overflow-hidden">
            <button
              id="mock-accounts-toggle"
              type="button"
              onClick={() => setShowMockPanel((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100/70 dark:hover:bg-primary-900/30 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-primary-500/20 dark:bg-primary-500/30 flex items-center justify-center">
                  <i className="ri-flask-line text-primary-600 dark:text-primary-400 text-xs" />
                </div>
                <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider">
                  Dev — Mock Accounts
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-primary-500 font-mono bg-primary-100 dark:bg-primary-900/40 px-2 py-0.5 rounded-md">
                  pw: {MOCK_PASSWORD}
                </span>
                <i className={`ri-arrow-down-s-line text-primary-500 transition-transform duration-200 ${showMockPanel ? "rotate-180" : ""}`} />
              </div>
            </button>

            {showMockPanel && (
              <div className="max-h-52 overflow-y-auto divide-y divide-background-100 dark:divide-foreground-800/60 animate-fade-in">
                {MOCK_ACCOUNTS.map((member) => {
                  const colors = ROLE_COLOR[member.role] ?? ROLE_COLOR["Cleaner"];
                  const isSelected = email === member.email;
                  return (
                    <button
                      key={member.id}
                      id={`mock-account-${member.id}`}
                      type="button"
                      onClick={() => quickLogin(member.email)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        isSelected
                          ? "bg-primary-50 dark:bg-primary-900/20"
                          : "bg-white dark:bg-foreground-900 hover:bg-background-50 dark:hover:bg-foreground-800/60"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0 border border-white dark:border-foreground-700`}>
                        <span className={`text-xs font-black font-heading ${colors.text}`}>
                          {getInitials(member.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-foreground-800 dark:text-foreground-200 truncate">
                            {member.name}
                          </p>
                          {isSelected && <i className="ri-check-circle-fill text-primary-500 text-xs shrink-0" />}
                        </div>
                        <p className="text-[11px] text-foreground-400 dark:text-foreground-500 truncate font-mono">
                          {member.email}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${colors.bg} shrink-0`}>
                        <i className={`${getRoleIcon(member.role)} text-[10px] ${colors.text}`} />
                        <span className={`text-[10px] font-semibold ${colors.text} whitespace-nowrap`}>
                          {member.role}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-foreground-500 dark:text-foreground-400 mt-6">
            Don't have an account?{" "}
            <Link to="/sign-up" className="font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
