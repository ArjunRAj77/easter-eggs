import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/* ═══════════════════════════════════════════════════════════════════════════
   META-EGGS
   ───────────────────────────────────────────────────────────────────────────
   A gallery of easter eggs that contains none of its own is a cookbook
   written by someone who doesn't cook.

     ↑↑↓↓←→←→BA   thirty lives, and a neon confetti cannon
     type "42"     the answer
     type "crt"    cabinet mode — 2.39:1 bars, deep vignette, scanlines up
     type "grain"  cycles the tube: crisp LCD → arcade CRT → dying monitor
     idle 45s      a pixel ghost drifts across the screen
     console       a banner, and a real window.eggs API

   Everything is keyboard-driven and nothing blocks the UI. Sequence capture
   is suppressed while an input has focus, so typing "no" in the search box
   never gets you halfway to cinema mode.
   ═══════════════════════════════════════════════════════════════════════════ */

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

/** Watches keystrokes for a set of literal sequences, ignoring form fields. */
const useSequences = (handlers: Record<string, () => void>) => {
  const bufRef = useRef('');
  const konamiRef = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el as HTMLElement | null)?.isContentEditable
      ) return;

      const key = e.key.toLowerCase();

      // Konami tracked separately — it uses arrow keys, which never belong
      // in the text buffer.
      if (key === KONAMI[konamiRef.current]) {
        konamiRef.current += 1;
        if (konamiRef.current === KONAMI.length) {
          konamiRef.current = 0;
          handlers.konami?.();
        }
      } else {
        konamiRef.current = key === KONAMI[0] ? 1 : 0;
      }

      if (key.length !== 1) return;
      bufRef.current = (bufRef.current + key).slice(-16);
      for (const word of Object.keys(handlers)) {
        if (word !== 'konami' && bufRef.current.endsWith(word)) {
          bufRef.current = '';
          handlers[word]();
          break;
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers]);
};

/* ── Gold confetti ─────────────────────────────────────────────────────── */

interface Flake { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; c: string; life: number; }

const GoldConfetti: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const PALETTE = ['#00e5ff', '#ff2d95', '#ffd23f', '#7cff4f', '#b06cff', '#ffffff'];
    const flakes: Flake[] = [];

    // Two cannons at the lower corners, angled inward — the standard stage
    // rig. A single centre burst reads as a fountain, not a celebration.
    for (const side of [0, 1]) {
      for (let i = 0; i < 130; i++) {
        const a = side ? -Math.PI / 2 - 0.55 - Math.random() * 0.5 : -Math.PI / 2 + 0.55 + Math.random() * 0.5;
        const s = 12 + Math.random() * 17;
        flakes.push({
          x: side ? w + 10 : -10,
          y: h + 10,
          vx: Math.cos(a) * s * (side ? -1 : 1) * -1,
          vy: Math.sin(a) * s,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.34,
          w: 5 + Math.random() * 7,
          h: 8 + Math.random() * 9,
          c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          life: 220 + Math.random() * 120,
        });
      }
    }

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const f of flakes) {
        f.vy += 0.26;
        f.vx *= 0.992;
        f.vy *= 0.992;
        f.x += f.vx;
        f.y += f.vy;
        f.rot += f.vr;
        f.life -= 1;
        if (f.life <= 0 || f.y > h + 60) continue;
        alive += 1;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.scale(Math.cos(f.rot * 1.5), 1);
        ctx.globalAlpha = Math.min(1, f.life / 60);
        ctx.fillStyle = f.c;
        ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h);
        ctx.restore();
      }
      if (alive === 0) { onDone(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return <canvas ref={ref} className="fixed inset-0 z-[90] pointer-events-none" aria-hidden="true" />;
};

/* ── The drifter ───────────────────────────────────────────────────────
   After 45 seconds of stillness a pixel ghost crosses the screen, bobbing
   on a sine. Attract mode: an idle cabinet always shows you *something*
   moving, because a still screen reads as broken. */

const Drifter: React.FC = () => (
  <motion.span
    className="fixed z-[58] pointer-events-none select-none font-pixel text-[20px]"
    style={{ color: 'var(--magenta)', textShadow: '0 0 14px var(--magenta)' }}
    initial={{ left: '104%', top: '62%' }}
    animate={{
      left: ['104%', '78%', '52%', '26%', '-8%'],
      top: ['62%', '48%', '58%', '42%', '52%'],
      opacity: [0, 0.85, 0.85, 0.85, 0],
    }}
    transition={{ duration: 15, ease: 'linear', times: [0, 0.2, 0.5, 0.8, 1] }}
    aria-hidden="true"
  >
    ▚▞▚
  </motion.span>
);

/* ── Component ─────────────────────────────────────────────────────────── */

export const MetaEggs: React.FC<{ onRandom: () => void; total: number }> = ({ onRandom, total }) => {
  const [confetti, setConfetti] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [answer, setAnswer] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [drifter, setDrifter] = useState(false);

  const flash = useCallback((msg: string) => {
    setBanner(msg);
    window.setTimeout(() => setBanner(null), 2800);
  }, []);

  /* Console banner + a real API. Anyone who opens devtools on a site about
     easter eggs has earned something to find there. */
  useEffect(() => {
    const neon = 'color:#00e5ff;font-weight:700';
    const dim = 'color:#6f679b';

    console.log(
      '%c\n  ▄▄▄▄▄ ▄▄▄▄▄ ▄▄▄▄▄\n  EASTER EGGS — ARCADE EDITION\n',
      'color:#ff2d95;font-family:monospace;font-size:13px;font-weight:700;text-shadow:0 0 8px #ff2d95',
    );
    console.log(`%c${total} secrets%c · try ↑↑↓↓←→←→BA, or type "crt", "42", "grain"`, neon, dim);
    console.log('%cwindow.eggs%c — random(), cinema(), list()', neon, dim);

    (window as unknown as Record<string, unknown>).eggs = {
      random: () => { onRandom(); return '🎲 rolled'; },
      cinema: () => { setCinema((v) => !v); return '🎬 toggled'; },
      list: () => { window.dispatchEvent(new CustomEvent('eggs:list')); return `${total} eggs — see the gallery`; },
      answer: 42,
    };

    return () => { delete (window as unknown as Record<string, unknown>).eggs; };
  }, [onRandom, total]);

  /* Cabinet mode drives CSS variables directly, so the CRT glass and the
     scanline plate already defined in index.css respond without re-rendering
     a single component. */
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--crt-vignette', cinema ? '0.92' : '0.6');
    root.style.setProperty('--scanline', cinema ? '0.14' : '0.055');
    root.style.setProperty('--roll', cinema ? '1' : '0');
  }, [cinema]);

  /* Idle detection for the moth. */
  useEffect(() => {
    let timer = window.setTimeout(() => setDrifter(true), 45000);
    const reset = () => {
      window.clearTimeout(timer);
      setDrifter(false);
      timer = window.setTimeout(() => setDrifter(true), 45000);
    };
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, []);

  const handlers = React.useMemo(
    () => ({
      konami: () => { setConfetti(true); flash('30 LIVES'); },
      '42': () => setAnswer(true),
      crt: () => { setCinema((v) => !v); flash(cinema ? 'LIGHTS UP' : 'CABINET MODE'); },
      grain: () => {
        const root = document.documentElement;
        const cur = parseFloat(getComputedStyle(root).getPropertyValue('--scanline')) || 0.055;
        // crisp LCD → arcade CRT → a monitor that needs replacing
        const next = cur < 0.03 ? 0.055 : cur < 0.09 ? 0.17 : 0.012;
        root.style.setProperty('--scanline', String(next));
        flash(next < 0.03 ? 'LCD — CRISP' : next < 0.09 ? 'ARCADE CRT' : 'DYING MONITOR');
      },
    }),
    [cinema, flash],
  );

  useSequences(handlers);

  useEffect(() => {
    if (!answer) return;
    const t = window.setTimeout(() => setAnswer(false), 4200);
    return () => window.clearTimeout(t);
  }, [answer]);

  return (
    <>
      {confetti && <GoldConfetti onDone={() => setConfetti(false)} />}
      {drifter && <Drifter />}

      {/* 2.39:1 letterbox bars */}
      <AnimatePresence>
        {cinema && (
          <>
            <motion.div
              initial={{ height: 0 }} animate={{ height: '9vh' }} exit={{ height: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 left-0 right-0 z-[80] pointer-events-none"
              style={{ background: '#000' }}
            />
            <motion.div
              initial={{ height: 0 }} animate={{ height: '9vh' }} exit={{ height: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-0 left-0 right-0 z-[80] pointer-events-none flex items-center justify-center"
              style={{ background: '#000' }}
            >
              <span className="font-pixel text-[10px] tracking-eyebrow" style={{ color: '#9f98c3' }}>
                2.39 : 1 — TYPE "CRT" TO EXIT
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[95] pointer-events-none px-6 py-3 rounded-xl"
            style={{
              background: 'rgba(6,4,15,0.92)',
              border: '1px solid var(--cyan)',
              boxShadow: '0 0 50px -12px var(--cyan)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span className="font-display text-[14px] tracking-title" style={{ color: '#fff', textShadow: '0 0 6px #fff, 0 0 22px var(--cyan)' }}>{banner}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The answer */}
      <AnimatePresence>
        {answer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[92] flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(6,4,15,0.76)', backdropFilter: 'blur(6px)' }}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 190, damping: 15 }}
              className="text-center"
            >
              <p className="font-display text-[26vw] sm:text-[15rem] leading-none rgb-split" style={{ color: '#fff', textShadow: '0 0 10px #fff, 0 0 50px var(--cyan)' }}>42</p>
              <p className="mt-4 font-pixel text-[10px] tracking-eyebrow" style={{ color: 'var(--lime)' }}>
                LIFE · THE UNIVERSE · AND EVERYTHING
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
