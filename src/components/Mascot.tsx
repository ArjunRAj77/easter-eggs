import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Mood = 'idle' | 'watching' | 'startled' | 'asleep' | 'hatched';

interface MascotProps {
  /** 0–1. Drives how far along the hatch the character is. */
  progress: number;
  count: number;
  total: number;
  /** Bumped whenever a Chaotic egg is opened — the character flinches. */
  scareToken: number;
}

/**
 * YOLK — the cabinet mascot.
 *
 * The character is built from three ideas that together do almost all the
 * work of making something feel alive:
 *
 * 1. **The eyes track, but they lag.** Pupils lerp toward the cursor at 0.18
 *    per frame rather than snapping. Instant tracking reads as a mechanism;
 *    a few frames of lag reads as attention.
 *
 * 2. **Blinks are Poisson, not periodic.** A blink every N seconds is a
 *    metronome and the eye picks it up immediately. Random intervals between
 *    2.2s and 6.5s, with an occasional double-blink, read as a creature.
 *
 * 3. **Squash and stretch on every state change.** Nothing changes size
 *    without also changing shape. It's the oldest rule in character
 *    animation and it's the difference between a moving image and a body.
 *
 * The shell cracks as the collection fills, so the character is also the
 * progress bar. One object, two jobs.
 */
export const Mascot: React.FC<MascotProps> = ({ progress, count, total, scareToken }) => {
  const [mood, setMood] = useState<Mood>('idle');
  const [blink, setBlink] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [dismissed, setDismissed] = useState(false);

  const target = useRef({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<number | undefined>(undefined);

  const say = useCallback((line: string, ms = 3200) => {
    setSpeech(line);
    window.setTimeout(() => setSpeech((s) => (s === line ? null : s)), ms);
  }, []);

  /* ── Eye tracking ─────────────────────────────────────────────────────── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      // Clamped to a small ellipse so pupils never leave the sclera.
      const reach = Math.min(1, d / 320);
      target.current = { x: (dx / d) * reach * 3.4, y: (dy / d) * reach * 2.6 };

      setMood((m) => (m === 'asleep' || m === 'idle' ? 'watching' : m));
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setMood((m) => (m === 'hatched' ? m : 'asleep')), 22000);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    idleTimer.current = window.setTimeout(() => setMood('asleep'), 22000);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.clearTimeout(idleTimer.current);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      setPupil((p) => ({
        x: p.x + (target.current.x - p.x) * 0.18,
        y: p.y + (target.current.y - p.y) * 0.18,
      }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── Blinking ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    let timer: number;
    const schedule = () => {
      timer = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 110);
        // ~1 in 5 blinks is a double.
        if (Math.random() < 0.2) {
          window.setTimeout(() => {
            setBlink(true);
            window.setTimeout(() => setBlink(false), 100);
          }, 240);
        }
        schedule();
      }, 2200 + Math.random() * 4300);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  /* ── Reactions ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (scareToken === 0) return;
    setMood('startled');
    say(['That one bites.', 'Oh no.', 'Are you sure?', 'Chaos. Lovely.'][scareToken % 4], 2400);
    const t = window.setTimeout(() => setMood('watching'), 1100);
    return () => window.clearTimeout(t);
  }, [scareToken, say]);

  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current) {
      const milestones: Record<number, string> = {
        1: 'First one! Only 59 to go.',
        10: 'Ten down. Warming up.',
        25: 'Nearly halfway.',
        30: 'Half the jar. Nice.',
        45: 'Three quarters!',
        59: 'One left. ONE.',
      };
      const line = milestones[count];
      if (line) say(line, 4200);
      if (count === total) {
        setMood('hatched');
        say('You found everything. Go outside.', 9000);
      }
    }
    prevCount.current = count;
  }, [count, total, say]);

  if (dismissed) return null;

  const hatched = mood === 'hatched' || progress >= 1;
  const asleep = mood === 'asleep';
  const startled = mood === 'startled';

  // Shell cracks appear in stages as the jar fills — the character *is* the
  // progress bar, so there's no second UI to keep in sync.
  const cracks = Math.floor(progress * 4);

  return (
    <div
      ref={wrapRef}
      className="fixed bottom-5 left-5 z-[85] select-none"
      style={{ width: 78 }}
    >
      <AnimatePresence>
        {speech && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.26, ease: [0.34, 1.7, 0.5, 1] }}
            className="absolute bottom-[86px] left-0 whitespace-nowrap px-3 py-2 rounded-lg text-[11px] font-medium"
            style={{
              background: 'rgba(16, 10, 36, 0.96)',
              color: 'var(--text-100)',
              border: '1px solid rgba(0, 229, 255, 0.4)',
              boxShadow: '0 0 22px -6px var(--cyan)',
            }}
          >
            {speech}
            <span
              className="absolute -bottom-[5px] left-6 w-2 h-2 rotate-45"
              style={{
                background: 'rgba(16, 10, 36, 0.96)',
                borderRight: '1px solid rgba(0, 229, 255, 0.4)',
                borderBottom: '1px solid rgba(0, 229, 255, 0.4)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => {
          if (hatched) { say('We did it.', 2600); return; }
          setMood('startled');
          say(['Hi.', 'Poke me again.', 'I am an egg.', `${count}/${total}`, 'Try the Konami code.'][Math.floor(Math.random() * 5)]);
          window.setTimeout(() => setMood('watching'), 900);
        }}
        onDoubleClick={() => setDismissed(true)}
        aria-label={`Yolk the mascot — ${count} of ${total} eggs collected. Click to poke, double-click to dismiss.`}
        className="relative block w-[72px] h-[84px] cursor-pointer"
        animate={
          startled
            ? { scale: [1, 1.22, 0.9, 1.05, 1], y: [0, -12, 0], rotate: [0, -8, 6, 0] }
            : asleep
            ? { scale: [1, 1.03, 1], y: 0, rotate: 0 }
            : { scale: 1, y: [0, -4, 0], rotate: 0 }
        }
        transition={
          startled
            ? { duration: 0.6, ease: [0.34, 1.7, 0.5, 1] }
            : asleep
            ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 3.4, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        <svg viewBox="0 0 72 84" width="72" height="84" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="shell" cx="36%" cy="28%">
              <stop offset="0%" stopColor="#fdfbff" />
              <stop offset="55%" stopColor="#e4dcff" />
              <stop offset="100%" stopColor="#b9abe8" />
            </radialGradient>
            <filter id="mglow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Contact shadow. Without one the character floats; with one it
              has weight and a floor. */}
          <ellipse cx="36" cy="80" rx={startled ? 15 : 19} ry="4" fill="rgba(176,108,255,0.28)" />

          {/* The shell — a true egg curve, wider low than high. */}
          <path
            d="M36 6 C50 6 62 26 62 46 C62 64 50 76 36 76 C22 76 10 64 10 46 C10 26 22 6 36 6 Z"
            fill="url(#shell)"
            stroke={hatched ? 'var(--lime)' : 'rgba(176,108,255,0.55)'}
            strokeWidth="1.5"
            filter={hatched ? 'url(#mglow)' : undefined}
          />

          {/* Progressive cracks */}
          {cracks >= 1 && <path d="M20 30 l6 5 -4 5 7 4" fill="none" stroke="#8a7bb8" strokeWidth="1.4" strokeLinecap="round" />}
          {cracks >= 2 && <path d="M52 38 l-6 4 4 6 -6 3" fill="none" stroke="#8a7bb8" strokeWidth="1.4" strokeLinecap="round" />}
          {cracks >= 3 && <path d="M30 62 l5 -4 3 6 6 -3" fill="none" stroke="#8a7bb8" strokeWidth="1.4" strokeLinecap="round" />}

          {/* Specular — the one place a highlight still belongs, because a
              shell is glossy and it's what makes it read as a solid object. */}
          <ellipse cx="26" cy="26" rx="7" ry="9" fill="rgba(255,255,255,0.55)" transform="rotate(-18 26 26)" />

          {/* Eyes */}
          {asleep ? (
            <>
              <path d="M22 44 q5 5 10 0" fill="none" stroke="#3b3260" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M40 44 q5 5 10 0" fill="none" stroke="#3b3260" strokeWidth="2.4" strokeLinecap="round" />
              <text x="56" y="24" fontSize="11" fill="var(--violet)" fontFamily="monospace" className="animate-attract">z</text>
              <text x="62" y="15" fontSize="8" fill="var(--violet)" fontFamily="monospace" opacity="0.6">z</text>
            </>
          ) : blink ? (
            <>
              <path d="M22 44 h10" stroke="#3b3260" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M40 44 h10" stroke="#3b3260" strokeWidth="2.6" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx="27" cy="44" rx="6" ry={startled ? 8 : 6.5} fill="#fff" />
              <ellipse cx="45" cy="44" rx="6" ry={startled ? 8 : 6.5} fill="#fff" />
              <circle cx={27 + pupil.x} cy={44 + pupil.y} r={startled ? 2.2 : 3.1} fill="#241d40" />
              <circle cx={45 + pupil.x} cy={44 + pupil.y} r={startled ? 2.2 : 3.1} fill="#241d40" />
              <circle cx={26 + pupil.x} cy={42.6 + pupil.y} r="1" fill="#fff" opacity="0.9" />
              <circle cx={44 + pupil.x} cy={42.6 + pupil.y} r="1" fill="#fff" opacity="0.9" />
            </>
          )}

          {/* Mouth */}
          {hatched ? (
            <path d="M28 57 q8 9 16 0" fill="#241d40" stroke="#241d40" strokeWidth="1.5" strokeLinejoin="round" />
          ) : startled ? (
            <ellipse cx="36" cy="58" rx="4" ry="5" fill="#241d40" />
          ) : asleep ? (
            <path d="M32 58 h8" stroke="#3b3260" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M30 57 q6 5 12 0" fill="none" stroke="#3b3260" strokeWidth="2" strokeLinecap="round" />
          )}

          {/* Blush */}
          <ellipse cx="18" cy="53" rx="4" ry="2.6" fill="rgba(255,45,149,0.30)" />
          <ellipse cx="54" cy="53" rx="4" ry="2.6" fill="rgba(255,45,149,0.30)" />

          {hatched && (
            <g className="animate-attract">
              <path d="M36 0 l2.4 5 5.4.6 -4 3.7 1.1 5.3 -4.9-2.7 -4.9 2.7 1.1-5.3 -4-3.7 5.4-.6 Z" fill="var(--amber)" />
            </g>
          )}
        </svg>
      </motion.button>

      {/* Counter plate */}
      <div
        className="mt-1 px-2 py-1 rounded text-center font-pixel text-[10px] leading-none"
        style={{
          background: 'rgba(6,4,15,0.85)',
          color: hatched ? 'var(--lime)' : 'var(--text-300)',
          border: `1px solid ${hatched ? 'rgba(124,255,79,0.5)' : 'rgba(176,108,255,0.28)'}`,
        }}
      >
        {count}/{total}
      </div>
    </div>
  );
};
