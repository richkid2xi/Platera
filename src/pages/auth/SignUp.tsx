import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import ShutterImagePanel from "@/components/feature/ShutterImagePanel";
import CustomSelect from "@/components/base/CustomSelect";
import { apiClient } from "@/api/client";

// ── Animated counter hook ──────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
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
    <div className="space-y-1.5 animate-fade-in mt-2">
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

export default function SignUp() {
  const { signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Owner Account
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Restaurant Details
  const [restaurantName, setRestaurantName] = useState("");
  const [businessType, setBusinessType] = useState("Restaurant");
  const [address, setAddress] = useState("");
  const [tablesCount, setTablesCount] = useState<number | "">("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailInUse, setEmailInUse] = useState(false);

  useEffect(() => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailInUse(false);
      return;
    }
    const delay = setTimeout(async () => {
      setIsCheckingEmail(true);
      try {
        const res = await apiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
        setEmailInUse(res.data.inUse);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingEmail(false);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [email]);
  
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

  // Inline Validation for Step 1
  const isPhoneValid = phone.length >= 8;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const isConfirmPasswordValid = password === confirmPassword;
  
  const isStep1Valid = name.trim() && isPhoneValid && isEmailValid && !emailInUse && isPasswordValid && isConfirmPasswordValid;

  // Inline Validation for Step 2
  const isStep2Valid = restaurantName.trim() && businessType && address.trim() && tablesCount !== "" && Number(tablesCount) > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (isStep1Valid) {
        setError(null);
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      if (isStep2Valid) {
        setError(null);
        setStep(3);
      }
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      await signUp({
        name,
        email,
        password,
        phone,
        restaurantName,
        address,
        tablesCount: Number(tablesCount)
      });
      
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      if (err.isNetworkError || err.code === 'ERR_NETWORK' || !err.response) {
        setError("Cannot connect to the server. Please check your internet connection and try again.");
      } else if (err.response?.status === 429) {
        setError("Too many registration attempts. Please wait a moment and try again.");
      } else {
        setError(err.response?.data?.error || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background-50 dark:bg-foreground-950 font-body relative overflow-hidden">
      {/* ── Left decorative panel ── */}
      <ShutterImagePanel className="hidden lg:flex lg:w-[40%] xl:w-[42%] relative flex-col p-8 xl:p-10 gap-6 overflow-hidden">
        {/* Accent orbs (optional extra styling over the images) */}
        <div className="absolute top-[-100px] right-[-60px] w-[360px] h-[360px] rounded-full bg-primary-500/20 blur-3xl pointer-events-none z-10" />
        <div className="absolute bottom-[-80px] left-[-40px] w-[300px] h-[300px] rounded-full bg-accent-500/15 blur-3xl pointer-events-none z-10" />

        {/* Logo */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center">
            <img src="/favicon.png" alt="Platera Bowl" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-black text-white font-heading tracking-tight drop-shadow-md">
            Platera
          </span>
        </div>

        {/* Stats */}
        <div className="relative z-20 space-y-5 flex-1 flex flex-col justify-center">
          <div>
            <h2 className="text-2xl xl:text-3xl font-black text-white font-heading leading-tight mb-2 drop-shadow-sm">
              Join thousands of
              <br />
              <span className="text-primary-400">restaurants</span> thriving
              <br />
              with Platera.
            </h2>
            <p className="text-foreground-300 leading-relaxed max-w-sm">
              Set up in minutes. No credit card required. Cancel anytime.
            </p>
          </div>

          <div ref={statsRef} className="grid grid-cols-2 gap-x-6 gap-y-4">
            {STATS.map((s) => (
              <StatItem key={s.label} {...s} animate={statsVisible} />
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-20 flex items-center gap-3">
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
          <p className="text-foreground-300 text-sm">
            <span className="text-white font-semibold">140+ teams</span> joined this week
          </p>
        </div>
      </ShutterImagePanel>

      {/* ── Right form panel ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-6 relative overflow-y-auto bg-white dark:bg-foreground-950">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl flex items-center justify-center text-foreground-500 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 transition-colors"
          aria-label="Toggle theme"
        >
          <i className={theme === "dark" ? "ri-sun-line text-lg" : "ri-moon-line text-lg"} />
        </button>

        <div className="w-full max-w-[420px] animate-fade-in-up my-auto">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/favicon.png" alt="Platera Bowl" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black text-foreground-900 dark:text-foreground-100 font-heading">
              Platera
            </span>
          </div>

          {/* Header & Progress Indicator */}
          <div className="mb-4">
            {/* Step labels */}
            <div className="flex items-center justify-between mb-1">
              {["Personal info", "Restaurant info", "Payment"].map((label, idx) => (
                <span
                  key={label}
                  className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    step === idx + 1
                      ? "text-primary-500"
                      : step > idx + 1
                      ? "text-foreground-400 dark:text-foreground-500"
                      : "text-foreground-300 dark:text-foreground-700"
                  } ${idx === 1 ? "text-center flex-1" : idx === 2 ? "text-right" : ""}`}
                >
                  {step === idx + 1 && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500 mr-1 mb-px align-middle animate-pulse" />}
                  {label}
                </span>
              ))}
            </div>
            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-3">
              <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-primary-500" : "bg-background-200 dark:bg-foreground-800"}`} />
              <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-primary-500" : "bg-background-200 dark:bg-foreground-800"}`} />
              <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 3 ? "bg-primary-500" : "bg-background-200 dark:bg-foreground-800"}`} />
            </div>
            <h1 className="text-2xl font-black text-foreground-950 dark:text-foreground-50 font-heading tracking-tight mb-0.5">
              {step === 1 ? "Create an account" : step === 2 ? "Your restaurant" : "Start your free trial"}
            </h1>
            <p className="text-sm text-foreground-500 dark:text-foreground-400">
              {step === 1 ? "Set up your owner profile to get started" : step === 2 ? "We'll tailor your dashboard to your business" : "No commitment. Cancel anytime."}
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
            
            {/* STEP 1 FIELDS */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label htmlFor="signup-name" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
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

                {/* Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="signup-phone" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
                    Phone number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500">
                      <i className="ri-phone-line text-base" />
                    </span>
                    <input
                      id="signup-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 24 123 4567"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${phone && !isPhoneValid ? 'border-red-300 dark:border-red-700 focus:ring-red-400' : 'border-background-200 dark:border-foreground-700 focus:ring-primary-400 dark:focus:ring-primary-500'} bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm`}
                    />
                  </div>
                  {phone && !isPhoneValid && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i> Please enter a valid phone number.
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="signup-email" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
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
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${email && !isEmailValid ? 'border-red-300 dark:border-red-700 focus:ring-red-400' : 'border-background-200 dark:border-foreground-700 focus:ring-primary-400 dark:focus:ring-primary-500'} bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm`}
                    />
                  </div>
                  {email && !isEmailValid && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i> Please enter a valid email address.
                    </p>
                  )}
                  {isEmailValid && isCheckingEmail && (
                    <p className="text-xs text-foreground-400 mt-1 flex items-center gap-1">
                      <i className="ri-loader-4-line animate-spin"></i> Checking availability...
                    </p>
                  )}
                  {isEmailValid && !isCheckingEmail && emailInUse && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <i className="ri-error-warning-fill"></i> Email is already in use.
                    </p>
                  )}
                  {isEmailValid && !isCheckingEmail && !emailInUse && email.length > 0 && (
                    <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <i className="ri-check-line"></i> Email is available.
                    </p>
                  )}
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="signup-password" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
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
                        placeholder="Min. 8 chars"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="signup-confirm-password" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
                      Confirm
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500">
                        <i className="ri-lock-check-line text-base" />
                      </span>
                      <input
                        id="signup-confirm-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Retype password"
                        className={`w-full pl-10 pr-10 py-3 rounded-xl border ${confirmPassword && !isConfirmPasswordValid ? 'border-red-300 dark:border-red-700 focus:ring-red-400' : 'border-background-200 dark:border-foreground-700 focus:ring-primary-400 dark:focus:ring-primary-500'} bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500 hover:text-foreground-600 transition-colors"
                      >
                        <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {confirmPassword && !isConfirmPasswordValid && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i> Passwords do not match.
                  </p>
                )}
                
                <PasswordStrength password={password} />

                {/* Submit Step 1 */}
                <button
                  type="submit"
                  disabled={!isStep1Valid}
                  className="w-full mt-4 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover-lift"
                >
                  Continue <i className="ri-arrow-right-line" />
                </button>
              </div>
            )}

            {/* STEP 2 FIELDS */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                {/* Restaurant name */}
                <div className="space-y-1.5">
                  <label htmlFor="restaurant-name" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
                    Restaurant Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500">
                      <i className="ri-store-2-line text-base" />
                    </span>
                    <input
                      id="restaurant-name"
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="e.g. The Rustic Oven"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Business Type */}
                <div className="space-y-1.5">
                  <label htmlFor="business-type" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
                    Business Type
                  </label>
                  <div className="relative z-50">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500 z-10">
                      <i className="ri-building-4-line text-base" />
                    </span>
                    <CustomSelect
                      value={businessType}
                      onChange={setBusinessType}
                      options={[
                        { label: 'Restaurant', value: 'Restaurant' },
                        { label: 'Bar', value: 'Bar' },
                        { label: 'Café', value: 'Café' },
                        { label: 'Fast Food', value: 'Fast Food' },
                        { label: 'Hotel Restaurant', value: 'Hotel Restaurant' },
                        { label: 'Other', value: 'Other' },
                      ]}
                      className="w-full text-sm"
                      buttonClassName="pl-10 pr-4 py-3"
                    />
                  </div>
                </div>

                {/* Physical Address */}
                <div className="space-y-1.5">
                  <label htmlFor="address" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
                    Physical Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-foreground-400 dark:text-foreground-500">
                      <i className="ri-map-pin-line text-base" />
                    </span>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street, City"
                      rows={2}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent transition-all text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Number of tables */}
                <div className="space-y-1.5">
                  <label htmlFor="tables-count" className="block text-sm font-semibold text-foreground-700 dark:text-foreground-300">
                    Number of Tables
                  </label>
                  <p className="text-xs text-foreground-500 dark:text-foreground-400 mb-2">
                    We'll automatically generate QR codes for these tables.
                  </p>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-400 dark:text-foreground-500">
                      <i className="ri-layout-grid-line text-base" />
                    </span>
                    <input
                      id="tables-count"
                      type="number"
                      min="1"
                      value={tablesCount}
                      onChange={(e) => setTablesCount(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 15"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-background-200 dark:border-foreground-700 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-foreground-100 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl border border-background-200 dark:border-foreground-700 text-foreground-600 hover:bg-background-50 dark:hover:bg-foreground-800 transition-colors"
                    aria-label="Go back"
                  >
                    <i className="ri-arrow-left-line" />
                  </button>
                  <button
                    type="submit"
                    disabled={!isStep2Valid}
                    className="flex-1 py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover-lift"
                  >
                    Continue <i className="ri-arrow-right-line" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: TRIAL CONFIRMATION */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in text-center mt-8">
                <div className="mx-auto w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center mb-8 shadow-xl shadow-primary-500/30">
                  <i className="ri-check-line text-4xl"></i>
                </div>

                <h2 className="text-3xl font-black text-foreground-900 dark:text-foreground-100 font-heading tracking-tight mb-3">
                  You're in!
                </h2>
                
                <div className="bg-white dark:bg-foreground-900 p-6 rounded-2xl border border-background-200 dark:border-foreground-800 shadow-sm mb-6 relative overflow-hidden">
                  {/* Subtle decorative glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                  
                  <p className="text-foreground-600 dark:text-foreground-400 leading-relaxed relative z-10">
                    We've activated your <strong>14-day free trial</strong>. <br className="hidden sm:block" />No credit card required right now.
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-background-100 dark:border-foreground-800/60 inline-flex items-center justify-center gap-2 text-sm font-semibold text-foreground-800 dark:text-foreground-200 relative z-10">
                    <i className="ri-calendar-check-line text-primary-500 text-lg"></i>
                    Trial ends on {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover-lift"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting up your dashboard...
                    </>
                  ) : (
                    <>
                      Go to Dashboard <i className="ri-arrow-right-line text-xl leading-none" />
                    </>
                  )}
                </button>
              </div>
            )}
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
