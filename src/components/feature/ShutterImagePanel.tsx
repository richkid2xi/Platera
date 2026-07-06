import { useState, useEffect, useRef, useCallback } from 'react';

const IMAGES = [
  '/images/auth-shutter-1.jpg',
  '/images/auth-shutter-2.jpg',
  '/images/auth-shutter-3.jpg',
  '/images/auth-shutter-4.jpg',
  '/images/auth-shutter-5.jpg',
  '/images/auth-shutter-6.jpg',
];

const SLAT_COUNT = 10;           // number of vertical blinds strips
const CYCLE_MS = 5000;           // time between transitions
const SLAT_DURATION_MS = 220;    // each slat animation (must match CSS)
const STAGGER_MS = 30;           // delay between consecutive slats
// Total close time = SLAT_DURATION_MS + (SLAT_COUNT-1)*STAGGER_MS

interface ShutterImagePanelProps {
  /** Optional children rendered on top of the image (logo, stats, etc.) */
  children?: React.ReactNode;
  className?: string;
}

type Phase = 'idle' | 'closing' | 'opening';

export default function ShutterImagePanel({ children, className = '' }: ShutterImagePanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [phase, setPhase] = useState<Phase>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const runTransition = useCallback(() => {
    // Phase 1: close shutters over current image
    setPhase('closing');

    // Phase 2: swap image once shutters are fully closed
    const closeTime = SLAT_DURATION_MS + (SLAT_COUNT - 1) * STAGGER_MS + 40; // +40ms buffer
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => {
        const ni = (prev + 1) % IMAGES.length;
        setNextIndex((ni + 1) % IMAGES.length);
        return ni;
      });

      // Phase 3: open shutters to reveal new image
      setPhase('opening');

      timerRef.current = setTimeout(() => {
        setPhase('idle');
        // Schedule next transition
        timerRef.current = setTimeout(runTransition, CYCLE_MS);
      }, closeTime);
    }, closeTime);
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(runTransition, CYCLE_MS);
    return () => clearTimer();
  }, [runTransition]);

  return (
    <aside className={`relative overflow-hidden ${className}`}>
      {/* Background layer — current image */}
      <div className="absolute inset-0 transition-none">
        <img
          src={IMAGES[currentIndex]}
          alt="Restaurant atmosphere"
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground-950 via-foreground-950/70 to-foreground-950/30" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/20 via-transparent to-transparent" />
        {/* Right-edge vignette — darkens the photo edge, looks natural in both light & dark */}
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-foreground-950/70" />
      </div>

      {/* Shutter layer — vertical slats */}
      <div
        className={`absolute inset-0 z-20 pointer-events-none ${
          phase === 'closing' ? 'shutter-closing' : phase === 'opening' ? 'shutter-opening' : ''
        }`}
        aria-hidden="true"
      >
        {Array.from({ length: SLAT_COUNT }).map((_, i) => (
          <div
            key={i}
            className="shutter-slat"
            style={{
              left: `${(i / SLAT_COUNT) * 100}%`,
              width: `${100 / SLAT_COUNT + 0.5}%`, // slight overlap to avoid gaps
              animationDelay: `${i * STAGGER_MS}ms`,
            }}
          />
        ))}
      </div>

      {/* Preload next image invisibly */}
      <img
        src={IMAGES[nextIndex]}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        alt=""
        aria-hidden
      />

      {/* Content layer (logo, headlines, stats, etc.) */}
      <div className="relative z-30 h-full flex flex-col pointer-events-auto">
        {children}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-1.5">
        {IMAGES.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === currentIndex
                ? 'w-5 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-white/30'
            }`}
          />
        ))}
      </div>
    </aside>
  );
}
