import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/api/client";
import ShutterImagePanel from "@/components/feature/ShutterImagePanel";

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

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email format validation
  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to request OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/verify-otp', { email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/reset-password', { email, otp, newPassword });
      navigate("/auth/signin", { state: { message: "Password reset successfully. Please sign in." } });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background-50 dark:bg-foreground-950 font-body transition-colors duration-300">
      {/* Left side panel (branding) */}
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

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <h2 className="text-3xl xl:text-4xl font-black text-white font-heading leading-[1.1]">
              Secure your account.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-md">
              We'll help you get back into Platera safely.
            </p>
          </div>
        </div>
      </ShutterImagePanel>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 animate-fade-in relative z-10 bg-background-50 dark:bg-foreground-950 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Logo / Back */}
          <div className="mb-10 lg:mb-12">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
              <i className="ri-restaurant-2-fill text-white text-2xl" />
            </div>
            {step === 1 && <h2 className="text-3xl font-black text-foreground-900 dark:text-white font-heading tracking-tight mb-2">Forgot Password</h2>}
            {step === 2 && <h2 className="text-3xl font-black text-foreground-900 dark:text-white font-heading tracking-tight mb-2">Verify OTP</h2>}
            {step === 3 && <h2 className="text-3xl font-black text-foreground-900 dark:text-white font-heading tracking-tight mb-2">Set New Password</h2>}
            
            <p className="text-foreground-500 font-medium">
              {step === 1 && "Enter your email and we'll send you a 6-digit code."}
              {step === 2 && `We sent a code to ${email}. Check your console logs (stubbed)!`}
              {step === 3 && "Create a new strong password."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-sm font-medium flex items-start gap-3 animate-shake">
              <i className="ri-error-warning-fill text-lg mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-5 animate-fade-in-up">
              <div>
                <label className="block text-sm font-bold text-foreground-900 dark:text-foreground-100 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  className="w-full px-4 py-3 rounded-xl border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-foreground-400"
                  required
                />
                {email.length > 0 && !isValidEmail && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><i className="ri-error-warning-line"></i> Invalid email format</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isValidEmail}
                className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-[15px] shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <i className="ri-loader-4-line animate-spin text-xl" /> : "Send Code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5 animate-fade-in-up">
              <div>
                <label className="block text-sm font-bold text-foreground-900 dark:text-foreground-100 mb-2">6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 text-center tracking-[0.5em] text-2xl font-mono rounded-xl border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all placeholder:text-foreground-200 dark:placeholder:text-foreground-800"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-[15px] shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <i className="ri-loader-4-line animate-spin text-xl" /> : "Verify Code"}
              </button>
              
              <div className="text-center mt-4">
                <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-foreground-500 hover:text-foreground-900 dark:hover:text-white transition-colors">
                  Wrong email? Go back
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5 animate-fade-in-up">
              <div>
                <label className="block text-sm font-bold text-foreground-900 dark:text-foreground-100 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-4 py-3 rounded-xl border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-400 hover:text-foreground-600 transition-colors"
                  >
                    <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"} />
                  </button>
                </div>
                <PasswordStrength password={newPassword} />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground-900 dark:text-foreground-100 mb-2">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 rounded-xl border border-background-200 dark:border-foreground-800 bg-white dark:bg-foreground-900 text-foreground-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-[15px] shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <i className="ri-loader-4-line animate-spin text-xl" /> : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-background-200 dark:border-foreground-800 text-center">
            <p className="text-foreground-500 text-sm font-medium">
              Remembered your password?{" "}
              <Link to="/auth/signin" className="text-primary-500 hover:text-primary-600 font-bold hover:underline underline-offset-4 decoration-2 transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
