import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background-50 dark:bg-foreground-950 flex flex-col items-center justify-center px-4 font-body relative overflow-hidden animate-fade-in">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-500/10 dark:bg-secondary-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-lg mx-auto flex flex-col items-center">
        {/* Animated Icon */}
        <div className="relative w-32 h-32 mb-8 animate-bounce-slow">
          <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-full h-full bg-white dark:bg-foreground-900 rounded-full border border-background-200 dark:border-foreground-800 shadow-xl flex items-center justify-center z-10">
            <i className="ri-restaurant-2-line text-5xl text-primary-500"></i>
          </div>
          {/* Fun little 404 badge */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform rotate-12 font-heading">
            404
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-foreground-950 dark:text-foreground-100 font-heading mb-4 tracking-tight">
          Oops! Dish Not Found
        </h1>
        
        <p className="text-lg text-foreground-600 dark:text-foreground-400 mb-2">
          It looks like the page you are looking for isn't on the menu today.
        </p>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-background-100 dark:bg-foreground-800 rounded-lg text-sm text-foreground-500 dark:text-foreground-400 font-mono mb-8 border border-background-200 dark:border-foreground-700">
          <i className="ri-link-m"></i>
          {location.pathname}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border-2 border-background-200 dark:border-foreground-800 text-foreground-700 dark:text-foreground-300 font-semibold hover:bg-background-100 dark:hover:bg-foreground-800 transition-all flex items-center justify-center gap-2 hover-lift"
          >
            <i className="ri-arrow-left-line"></i>
            Go Back
          </button>
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 hover-lift"
            >
              <i className="ri-dashboard-line"></i>
              Back to Dashboard
            </button>
          ) : (
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 hover-lift"
            >
              <i className="ri-home-line"></i>
              Go to Home
            </button>
          )}
        </div>
      </div>
      
      {/* Giant faint 404 in background */}
      <div className="absolute bottom-0 text-[15rem] md:text-[20rem] font-black text-background-200 dark:text-foreground-900/40 select-none pointer-events-none z-0 tracking-tighter leading-none translate-y-1/4">
        404
      </div>
    </div>
  );
}