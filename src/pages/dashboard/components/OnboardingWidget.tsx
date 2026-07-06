import { Link } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function OnboardingWidget() {
  const { state, dismissOnboarding } = useOnboarding();
  const { completedSteps, isDismissed } = state;

  if (isDismissed) return null;

  const totalSteps = 4;
  const completedCount = completedSteps.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  if (completedCount === totalSteps) {
    // Optionally auto-dismiss or show a "All done!" state
    // Let's just return null if everything is done to clean up the dashboard.
    return null;
  }

  return (
    <div className="bg-white dark:bg-foreground-900 border border-background-200 dark:border-foreground-700 rounded-xl p-5 mb-2 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
        
        {/* Left column: Info & Progress */}
        <div className="flex-1 max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-foreground-900 dark:text-foreground-100 font-heading">
              Welcome to Platera!
            </h3>
            <button 
              onClick={dismissOnboarding}
              className="md:hidden text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>
          
          <p className="text-sm text-foreground-500 dark:text-foreground-400 mb-5 leading-relaxed">
            Let's get your restaurant fully set up. Complete these quick steps to start taking orders.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold font-body">
              <span className="text-foreground-700 dark:text-foreground-300">Setup Progress</span>
              <span className="text-primary-500">{completedCount} of {totalSteps} steps</span>
            </div>
            <div className="h-2 w-full bg-background-200 dark:bg-foreground-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 hidden md:block">
            <button
              onClick={dismissOnboarding}
              className="text-xs font-semibold text-foreground-400 hover:text-foreground-600 dark:hover:text-foreground-300 transition-colors"
            >
              Skip setup
            </button>
          </div>
        </div>

        {/* Right column: Checklist */}
        <div className="flex-[1.5] grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Step 1: Menu Item */}
          <div className={`p-3 rounded-lg border flex flex-col gap-3 transition-colors ${completedSteps.includes("menu_item") ? "bg-background-50 dark:bg-foreground-900/50 border-background-200 dark:border-foreground-800 opacity-60" : "bg-white dark:bg-foreground-800/50 border-background-200 dark:border-foreground-700 hover:border-primary-300 dark:hover:border-primary-700 shadow-sm"}`}>
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <i className={`ri-restaurant-line mt-0.5 ${completedSteps.includes("menu_item") ? "text-foreground-400" : "text-primary-500"}`} />
                <div>
                  <h4 className={`text-sm font-semibold ${completedSteps.includes("menu_item") ? "text-foreground-500 line-through" : "text-foreground-900 dark:text-foreground-100"}`}>Add first menu item</h4>
                  <p className="text-xs text-foreground-500 mt-0.5">Start building your catalog</p>
                </div>
              </div>
              {completedSteps.includes("menu_item") && (
                <i className="ri-checkbox-circle-fill text-green-500 text-lg" />
              )}
            </div>
            {!completedSteps.includes("menu_item") && (
              <Link to="/menu?add=true" className="text-xs font-bold text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 px-3 py-1.5 rounded-md text-center transition-colors">
                Start
              </Link>
            )}
          </div>

          {/* Step 2: Upload Logo */}
          <div className={`p-3 rounded-lg border flex flex-col gap-3 transition-colors ${completedSteps.includes("upload_logo") ? "bg-background-50 dark:bg-foreground-900/50 border-background-200 dark:border-foreground-800 opacity-60" : "bg-white dark:bg-foreground-800/50 border-background-200 dark:border-foreground-700 hover:border-primary-300 dark:hover:border-primary-700 shadow-sm"}`}>
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <i className={`ri-image-add-line mt-0.5 ${completedSteps.includes("upload_logo") ? "text-foreground-400" : "text-primary-500"}`} />
                <div>
                  <h4 className={`text-sm font-semibold ${completedSteps.includes("upload_logo") ? "text-foreground-500 line-through" : "text-foreground-900 dark:text-foreground-100"}`}>Upload logo</h4>
                  <p className="text-xs text-foreground-500 mt-0.5">Customize your brand</p>
                </div>
              </div>
              {completedSteps.includes("upload_logo") && (
                <i className="ri-checkbox-circle-fill text-green-500 text-lg" />
              )}
            </div>
            {!completedSteps.includes("upload_logo") && (
              <Link to="/settings?tab=profile" className="text-xs font-bold text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 px-3 py-1.5 rounded-md text-center transition-colors">
                Start
              </Link>
            )}
          </div>

          {/* Step 3: Review Tables */}
          <div className={`p-3 rounded-lg border flex flex-col gap-3 transition-colors ${completedSteps.includes("review_tables") ? "bg-background-50 dark:bg-foreground-900/50 border-background-200 dark:border-foreground-800 opacity-60" : "bg-white dark:bg-foreground-800/50 border-background-200 dark:border-foreground-700 hover:border-primary-300 dark:hover:border-primary-700 shadow-sm"}`}>
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <i className={`ri-qr-code-line mt-0.5 ${completedSteps.includes("review_tables") ? "text-foreground-400" : "text-primary-500"}`} />
                <div>
                  <h4 className={`text-sm font-semibold ${completedSteps.includes("review_tables") ? "text-foreground-500 line-through" : "text-foreground-900 dark:text-foreground-100"}`}>Review tables</h4>
                  <p className="text-xs text-foreground-500 mt-0.5">Download your QR codes</p>
                </div>
              </div>
              {completedSteps.includes("review_tables") && (
                <i className="ri-checkbox-circle-fill text-green-500 text-lg" />
              )}
            </div>
            {!completedSteps.includes("review_tables") && (
              <Link to="/tables" className="text-xs font-bold text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 px-3 py-1.5 rounded-md text-center transition-colors">
                Start
              </Link>
            )}
          </div>

          {/* Step 4: Invite Staff */}
          <div className={`p-3 rounded-lg border flex flex-col gap-3 transition-colors ${completedSteps.includes("invite_staff") ? "bg-background-50 dark:bg-foreground-900/50 border-background-200 dark:border-foreground-800 opacity-60" : "bg-white dark:bg-foreground-800/50 border-background-200 dark:border-foreground-700 hover:border-primary-300 dark:hover:border-primary-700 shadow-sm"}`}>
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <i className={`ri-team-line mt-0.5 ${completedSteps.includes("invite_staff") ? "text-foreground-400" : "text-primary-500"}`} />
                <div>
                  <h4 className={`text-sm font-semibold ${completedSteps.includes("invite_staff") ? "text-foreground-500 line-through" : "text-foreground-900 dark:text-foreground-100"}`}>Invite staff (Optional)</h4>
                  <p className="text-xs text-foreground-500 mt-0.5">Add managers and waiters</p>
                </div>
              </div>
              {completedSteps.includes("invite_staff") && (
                <i className="ri-checkbox-circle-fill text-green-500 text-lg" />
              )}
            </div>
            {!completedSteps.includes("invite_staff") && (
              <Link to="/staff" className="text-xs font-bold text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-500/10 hover:bg-primary-100 dark:hover:bg-primary-500/20 px-3 py-1.5 rounded-md text-center transition-colors">
                Start
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
