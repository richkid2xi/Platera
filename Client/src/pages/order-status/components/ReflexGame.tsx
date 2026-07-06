import { useState, useEffect, useCallback, useRef } from 'react';

const GAME_DURATION = 15;
const TARGET_COLORS = [
  'bg-primary-500',
  'bg-accent-500',
  'bg-secondary-500',
  'bg-foreground-800',
];

export default function ReflexGame() {
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'done'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [bestScore, setBestScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastTapId, setLastTapId] = useState(0);
  const [countdownNum, setCountdownNum] = useState(3);
  const [targetColor, setTargetColor] = useState(TARGET_COLORS[0]);
  const [tapFlashes, setTapFlashes] = useState<{ id: number; x: number; y: number }[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const randomizeTarget = useCallback(() => {
    const area = gameAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const padding = 40;
    const x = padding + Math.random() * (rect.width - padding * 2);
    const y = padding + Math.random() * (rect.height - padding * 2);
    setTargetPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    setTargetColor(TARGET_COLORS[Math.floor(Math.random() * TARGET_COLORS.length)]);
  }, []);

  const startCountdown = useCallback(() => {
    setGameState('countdown');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCombo(0);
    setCountdownNum(3);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      setCountdownNum(count);
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setGameState('playing');
        randomizeTarget();
      }
    }, 700);
  }, [randomizeTarget]);

  const endGame = useCallback(() => {
    setGameState('done');
    if (timerRef.current) clearInterval(timerRef.current);
    if (score > bestScore) {
      setBestScore(score);
    }
  }, [score, bestScore]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft <= 0) {
      endGame();
    }
  }, [timeLeft, gameState, endGame]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleTargetTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing') return;
    e.stopPropagation();
    e.preventDefault();

    const newCombo = combo + 1;
    setCombo(newCombo);
    const bonusPoints = newCombo > 3 ? Math.min(newCombo, 10) : 1;
    setScore((s) => s + bonusPoints);

    const tapId = lastTapId + 1;
    setLastTapId(tapId);

    const clientX = 'touches' in e ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || e.changedTouches[0]?.clientY : e.clientY;

    if (clientX && clientY && gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      setTapFlashes((prev) => [
        ...prev.slice(-4),
        { id: tapId, x: clientX - rect.left, y: clientY - rect.top },
      ]);
      setTimeout(() => {
        setTapFlashes((prev) => prev.filter((f) => f.id !== tapId));
      }, 400);
    }

    randomizeTarget();
  };

  const handleMiss = () => {
    if (gameState !== 'playing') return;
    setCombo(0);
  };

  if (gameState === 'idle') {
    return (
      <div className="px-4">
        <div className="bg-background-100 rounded-2xl p-5 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary-100 flex items-center justify-center">
            <i className="ri-flashlight-line text-2xl text-secondary-500"></i>
          </div>
          <h4 className="font-heading font-bold text-lg text-foreground-900 mb-1">
            Tap Frenzy
          </h4>
          <p className="font-body text-sm text-foreground-500 mb-1">
            Tap the targets as fast as you can in {GAME_DURATION} seconds!
          </p>
          {bestScore > 0 && (
            <p className="font-label text-xs font-semibold text-secondary-500 mb-3">
              Best: {bestScore} pts
            </p>
          )}
          <button
            onClick={startCountdown}
            className="bg-secondary-500 text-white font-heading font-bold text-sm py-3 px-6 rounded-xl active:scale-95 transition-transform"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'countdown') {
    return (
      <div className="px-4">
        <div className="bg-background-100 rounded-2xl p-5">
          <div className="flex items-center justify-center h-40">
            <span className="font-heading font-extrabold text-7xl text-primary-500 animate-bounce-in">
              {countdownNum}
            </span>
          </div>
          <p className="text-center font-body text-sm text-foreground-500">
            Get ready to tap!
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'done') {
    const isNewBest = score > 0 && score >= bestScore;
    return (
      <div className="px-4">
        <div className="bg-secondary-100 rounded-2xl p-5 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-secondary-500 flex items-center justify-center">
            <i className={`text-2xl text-white ${isNewBest ? 'ri-trophy-line' : 'ri-speed-up-line'}`}></i>
          </div>
          <h4 className="font-heading font-bold text-lg text-foreground-900 mb-1">
            {isNewBest ? 'New Best!' : 'Time is up!'}
          </h4>
          <p className="font-heading font-extrabold text-3xl text-secondary-600 mb-1">
            {score} pts
          </p>
          <p className="font-body text-xs text-foreground-500 mb-4">
            {score >= 30
              ? 'Incredible reflexes! You are lightning fast!'
              : score >= 20
                ? 'Great speed! Your thumbs are on fire!'
                : score >= 10
                  ? 'Not bad! Keep practicing those taps!'
                  : 'Give it another go — you will get faster!'}
          </p>
          <button
            onClick={() => {
              setGameState('idle');
              setScore(0);
              setTimeLeft(GAME_DURATION);
            }}
            className="bg-secondary-500 text-white font-heading font-bold text-sm py-2.5 px-5 rounded-xl active:scale-95 transition-transform"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="bg-background-100 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-background-200/50">
          <div className="flex items-center gap-2">
            <span className="font-label text-xs font-semibold text-secondary-500">
              Time
            </span>
            <span className="font-heading font-bold text-lg text-foreground-900">
              {timeLeft}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            {combo > 2 && (
              <span className="font-label text-xs font-bold text-accent-500 bg-accent-100 rounded-full px-2 py-0.5 animate-scale-in">
                {combo}x Combo!
              </span>
            )}
            <span className="font-heading font-bold text-lg text-secondary-500">
              {score}
            </span>
          </div>
        </div>

        <div
          ref={gameAreaRef}
          onClick={handleMiss}
          className="relative w-full h-56 bg-gradient-to-br from-background-200/50 to-background-100 overflow-hidden cursor-crosshair select-none touch-none"
        >
          {tapFlashes.map((flash) => (
            <div
              key={flash.id}
              className="absolute pointer-events-none"
              style={{ left: flash.x - 12, top: flash.y - 12 }}
            >
              <div className="w-6 h-6 rounded-full bg-primary-500/30 animate-tap-ripple"></div>
            </div>
          ))}

          <button
            onMouseDown={handleTargetTap}
            onTouchStart={handleTargetTap}
            className={`absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full ${targetColor} animate-target-pop active:scale-90 transition-transform duration-75`}
            style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
          >
            <span className="sr-only">Tap target</span>
          </button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="bg-background-50/90 rounded-full px-3 py-1 text-center">
              <span className="font-label text-[10px] text-foreground-500">
                Tap the circle as fast as you can!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}