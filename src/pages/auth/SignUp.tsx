import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type AuthUser } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const ROLES: { value: AuthUser["role"]; label: string; icon: string; desc: string }[] = [
  { value: "owner", label: "Owner", icon: "ri-shield-star-fill", desc: "Full access to all features" },
  { value: "manager", label: "Manager", icon: "ri-user-star-fill", desc: "Manage team & operations" },
  { value: "staff", label: "Staff", icon: "ri-user-fill", desc: "Orders & table management" },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-400", "bg-yellow-400", "bg-secondary-400", "bg-secondary-500"];
  const textColors = ["", "text-red-500", "text-yellow-500", "text-secondary-600", "text-secondary-600"];

  if (!password) return null;

  return (
    <div className="space-y-1.5 animate-fade-in">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : "bg-background-200 dark:bg-foreground-700"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score > 0 ? textColors[score] : ""}`}>
        {labels[score]}
      </p>
    </div>
  );
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

const STATS = [
  { label: "Restaurants", target: 2400, suffix: "+", icon: "ri-store-2-fill" },
  { label: "Uptime SLA", target: 98, suffix: "%", icon: "ri-flashlight-fill" },
  { label: "User Rating", target: 49, suffix: "", display: (v: number) => `${(v / 10).toFixed(1)} ★`, icon: "ri-star-fill" },
  { label: "Support", target: 24, suffix: "/7", display: () => "24/7", icon: "ri-headphone-fill" },
];

function StatCard({ label, target, suffix, display, icon, animate }: {
  label: string; target: number; suffix: string; icon: string;
  display?: (v: number) => string; animate: boolean;
}) {
  const value = useCountUp(target, 1800, animate);
  const shown = display ? display(value) : `${value.toLocaleString()}${suffix}`;
  return (
    <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
      <div className="flex items-center gap-2 mb-1">
        <i className={`${icon} text-primary-400 text-sm`} />
      </div>
      <p className="text-2xl font-black text-white font-heading tabular-nums">{shown}</p>
      <p className="text-foreground-400 text-xs mt-0.5">{label}</p>
    </div>
  );
}

export default function SignUp() {
  const { signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<AuthUser["role"]>("owner");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the terms and privacy policy.");
      return;
    }
    try {
      setIsLoading(true);
      await signUp(name, email, password, role);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background-50 dark:bg-foreground-950 font-body relative overflow-hidden">
      {/* ── Left decorative panel ── */}
      <aside className="hidden lg:flex lg:w-[44%] xl:w-[48%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Food Image Background */}
        <div className="absolute inset-0 bg-foreground-950">
          <img
            src="/auth-food-signup.png"
            alt="Delicious restaurant food plate"
            className="w-full h-full object-cover opacity-50 select-none pointer-events-none"
          />
          {/* Gradient overlays to dim the image and make text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground-950 via-foreground-950/90 to-foreground-950/60" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950/30 via-transparent to-accent-950/30" />
        </div>

        {/* Accent orbs */}
        <div className="absolute top-[-100px] right-[-60px] w-[360px] h-[360px] rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-40px] w-[300px] h-[300px] rounded-full bg-accent-500/15 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/40">
            <i className="ri-restaurant-2-line text-xl text-white" />
          </div>
          <span className="text-2xl font-black text-white font-heading tracking-tight drop-shadow-md">
            Platera
          </span>
        </div>

        {/* Stats */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl xl:text-4xl font-black text-white font-heading leading-tight mb-4 drop-shadow-sm">
              Join thousands of
              <br />
              <span className="text-primary-400">restaurants</span> thriving
              <br />
              with Platera.
            </h2>
            <p className="text-foreground-400 leading-relaxed">
              Set up in minutes. No credit card required.
              Cancel anytime.
            </p>
          </div>

          <div ref={statsRef} className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <StatCard key={s.label} {...s} animate={statsVisible} />
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {["#FF6B35", "#22C55E", "#D946EF"].map((bg, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-foreground-950 flex items-center justify-center text-white text-xs font-bold font-heading shadow"
                style={{ background: bg }}
              >
                {["J", "A", "R"][i]}
              </div>
            ))}
          </div>
          <p className="text-foreground-400 text-sm">
            <span className="text-white font-semibold">140+ teams</span> joined this week
          </p>
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto bg-white dark:bg-foreground-950">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl flex items-center justify-center text-foreground-500 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 transition-colors"
          aria-label="Toggle theme"
        >
          <i className={theme === "dark" ? "ri-sun-line text-lg" : "ri-moon-line text-lg"} />
        </button>

        <div className="w-full max-w-[420px] animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <i className="ri-restaurant-2-line text-lg text-white" />
            </div>
            <span className="text-xl font-black text-foreground-900 dark:text-foreground-100 font-heading">
              Platera
            </span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-3xl font-black text-foreground-950 dark:text-foreground-50 font-heading tracking-tight mb-2">
              Create an account
            </h1>
            <p className="text-foreground-500 dark:text-foreground-400">
              Get your restaurant dashboard ready in minutes
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm mb-5 animate-fade-in">
              <i className="ri-error-warning-line shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" id="sign-up-form" noValidate>
            {/* Full name */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-name"
                className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300"
              >
                Full name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500">
                  <i className="ri-user-line text-base" />
                </span>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jamie Rivera"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 dark:placeholder:text-foreground-600 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-email"
                className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300"
              >
                Email address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500">
                  <i className="ri-mail-line text-base" />
                </span>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 dark:placeholder:text-foreground-600 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="signup-password"
                className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500">
                  <i className="ri-lock-line text-base" />
                </span>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
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
              <PasswordStrength password={password} />
            </div>

            {/* Role selector */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
                Your role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon, desc }) => (
                  <button
                    key={value}
                    type="button"
                    id={`role-${value}`}
                    onClick={() => setRole(value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                      role === value
                        ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                        : "border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-foreground-600 dark:text-foreground-400 hover:border-primary-200 dark:hover:border-primary-800"
                    }`}
                    title={desc}
                  >
                    <i className={`${icon} text-xl`} />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-foreground-400 dark:text-foreground-600">
                {ROLES.find((r) => r.value === role)?.desc}
              </p>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative shrink-0 mt-0.5">
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    agreed
                      ? "border-primary-500 bg-primary-500"
                      : "border-background-300 dark:border-foreground-600 group-hover:border-primary-300"
                  }`}
                >
                  {agreed && <i className="ri-check-line text-white text-xs" />}
                </div>
              </div>
              <span className="text-sm text-foreground-500 dark:text-foreground-400 leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" className="text-primary-500 hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary-500 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 hover-lift"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  <i className="ri-rocket-2-line" />
                  Create account
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-foreground-500 dark:text-foreground-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
