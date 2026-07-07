import { useAuth } from '@/contexts/AuthContext';
import { createPortal } from 'react-dom';

export default function AuthLoaders() {
  const { user, isSettingUp, isLoggingOut, isLoading } = useAuth();

  if (!isSettingUp && !isLoggingOut && !isLoading) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-foreground-950 flex flex-col items-center justify-center p-6 font-body overflow-hidden animate-fade-in">
      {/* Decorative pulse rings (Dark themed) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
        <div className="w-64 h-64 rounded-full border border-primary-500/20 bg-primary-500/5 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute w-96 h-96 rounded-full border border-primary-500/10 bg-primary-500/5 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-24 h-24 bg-foreground-900 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl border border-foreground-800 scale-up">
        {isSettingUp || isLoading ? (
          <i className="ri-restaurant-2-line text-5xl text-primary-500 animate-pulse"></i>
        ) : (
          <i className="ri-lock-line text-5xl text-primary-500 animate-pulse"></i>
        )}
      </div>

      <div className="relative z-10 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {isLoading ? (
          <>
            <h1 className="text-4xl font-black font-heading mb-4 tracking-tight drop-shadow-sm text-foreground-50">
              Platera
            </h1>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-foreground-900 border border-foreground-800 text-foreground-300 shadow-sm">
              <span className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              <span className="font-semibold text-sm tracking-wide">Starting system...</span>
            </div>
          </>
        ) : isSettingUp ? (
          <>
            <h1 className="text-4xl font-black font-heading mb-4 tracking-tight drop-shadow-sm text-foreground-50">
              {user ? `Welcome back, ${user.name}` : 'Signing you in...'}
            </h1>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-foreground-900 border border-foreground-800 text-foreground-300 shadow-sm">
              <span className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              <span className="font-semibold text-sm tracking-wide">Setting up your dashboard...</span>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-black font-heading mb-4 tracking-tight drop-shadow-sm text-foreground-50">
              Signing out
            </h1>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-foreground-900 border border-foreground-800 text-foreground-300 shadow-sm">
              <span className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
              <span className="font-semibold text-sm tracking-wide">Securing your session...</span>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
