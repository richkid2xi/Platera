import { useParams, Link } from 'react-router-dom';
import { tables } from '@/mocks/tablets';

export default function OrderPlaceholder() {
  const { token } = useParams<{ token: string }>();
  
  const table = tables.find((t) => t.token === token);

  // Valid token
  if (table) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background-50 dark:bg-foreground-950">
        <div className="w-full max-w-md bg-white dark:bg-foreground-900 rounded-2xl border border-background-200 dark:border-foreground-800 p-8 shadow-xl text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-6">
            <i className="ri-tools-line text-3xl text-primary-500"></i>
          </div>
          <h1 className="text-2xl font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-2">
            Hold Your Horses!
          </h1>
          <p className="text-foreground-600 dark:text-foreground-400 font-body mb-6">
            You've successfully scanned the code for <strong className="text-foreground-900 dark:text-foreground-100">Table {table.number}</strong>, but the ordering experience is still under development.
          </p>
          <div className="p-4 bg-background-50 dark:bg-foreground-800/50 rounded-xl border border-background-200 dark:border-foreground-700">
            <p className="text-sm text-foreground-500 font-mono">
              Coming soon to a browser near you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Invalid token (Cheeky 404)
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background-50 dark:bg-foreground-950">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="text-[100px] font-black text-foreground-200 dark:text-foreground-800 leading-none mb-4 font-heading tracking-tighter">
          404
        </div>
        <h1 className="text-3xl font-bold text-foreground-900 dark:text-foreground-100 font-heading mb-4">
          Nice Try, Hacker.
        </h1>
        <p className="text-foreground-600 dark:text-foreground-400 font-body mb-8 text-lg">
          Looks like you tried to alter the table link or entered an invalid code. We see you! 🕵️‍♂️
        </p>
        <div className="p-6 bg-white dark:bg-foreground-900 rounded-2xl border border-background-200 dark:border-foreground-800 shadow-lg">
          <i className="ri-alarm-warning-line text-4xl text-accent-500 mb-4 inline-block"></i>
          <p className="text-sm font-medium text-foreground-700 dark:text-foreground-300">
            Please scan the QR code on your table again to access the correct menu. Don't go changing URLs manually!
          </p>
        </div>
        <Link to="/" className="inline-block mt-8 text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
          Return to civilization
        </Link>
      </div>
    </div>
  );
}
