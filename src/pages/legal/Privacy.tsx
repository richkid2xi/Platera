import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

export default function Privacy() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background-50 dark:bg-foreground-950 font-body relative overflow-hidden flex flex-col justify-between py-12 px-6">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-primary-500/5 dark:bg-primary-500/2 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] rounded-full bg-accent-500/5 dark:bg-accent-500/2 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between z-10 mb-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <i className="ri-restaurant-2-line text-lg text-white" />
          </div>
          <span className="text-xl font-black text-foreground-900 dark:text-foreground-100 font-heading">
            Platera
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground-500 dark:text-foreground-400 hover:bg-background-100 dark:hover:bg-foreground-800 transition-colors"
          aria-label="Toggle theme"
        >
          <i className={theme === "dark" ? "ri-sun-line text-lg" : "ri-moon-line text-lg"} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl w-full mx-auto bg-white dark:bg-foreground-900 rounded-3xl border border-background-200 dark:border-foreground-800 p-8 md:p-12 shadow-xl shadow-foreground-900/5 dark:shadow-none z-10 flex-1">
        <div className="flex items-center gap-3 text-primary-500 font-bold text-xs uppercase tracking-wider mb-3">
          <i className="ri-shield-user-line text-sm" />
          Privacy Policy
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-foreground-950 dark:text-foreground-100 font-heading tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-xs text-foreground-400 dark:text-foreground-500 font-mono mb-8">
          Last Updated: July 4, 2026
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground-600 dark:text-foreground-400 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-200 font-heading">
              1. Information We Collect
            </h2>
            <p>
              We collect information that you directly provide to us during account registration and system setup,
              such as your name, business email address, phone number, role type, and specific configuration
              choices for your restaurant (e.g. menu items, table layouts, and staff details).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-200 font-heading">
              2. How We Use Your Information
            </h2>
            <p>
              Your data is utilized to deliver, support, and enhance our restaurant dashboard services. This
              includes processing orders, tracking inventory levels, calculating sales reports, and helping you
              monitor your staff operations in real-time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-200 font-heading">
              3. Data Security and Retention
            </h2>
            <p>
              We prioritize security by using advanced encryption technologies to protect your details. We retain
              your business information only as long as you maintain your account or as required to comply with
              applicable tax, accounting, or legal requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-200 font-heading">
              4. Cookies and Analytical Tools
            </h2>
            <p>
              We use secure session storage and essential cookies to keep you signed in, remember your dashboard
              view preferences (such as light/dark mode selection), and monitor app performance to detect potential errors.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-foreground-900 dark:text-foreground-200 font-heading">
              5. Your Rights and Choices
            </h2>
            <p>
              You have the right to access, correct, update, or delete your personal details. You can make updates
              directly in the "Profile" or "Settings" screens of the dashboard, or contact us if you need help
              terminating your account.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-background-200 dark:border-foreground-800 flex items-center justify-between">
          <Link
            to="/sign-up"
            className="px-5 py-2.5 rounded-xl border border-background-200 dark:border-foreground-800 text-foreground-700 dark:text-foreground-300 font-semibold hover:bg-background-50 dark:hover:bg-foreground-800 transition-all text-sm flex items-center gap-2 hover-lift"
          >
            <i className="ri-arrow-left-line" /> Back to Sign Up
          </Link>
          <Link
            to="/terms"
            className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors flex items-center gap-1"
          >
            Read Terms of Service <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-foreground-400 mt-8 z-10">
        &copy; {new Date().getFullYear()} Platera. All rights reserved.
      </footer>
    </div>
  );
}
