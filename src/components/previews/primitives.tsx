import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Play, RotateCcw } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   PREVIEW PRIMITIVES
   ───────────────────────────────────────────────────────────────────────────
   Shared furniture for the 40-odd live demos. Every preview is built from
   these so they all feel like the same instrument: one stage, one tally
   light, one trigger.

   Nothing here loads an external asset. Sounds are synthesised with WebAudio,
   graphics are canvas or CSS. A preview that 404s is worse than no preview.
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The stage. A recessed panel with a tally light — the little lamp on a
 * studio camera that tells you which one is hot. Gold when armed, green when
 * the effect is running.
 */
export const Stage: React.FC<{
  children: React.ReactNode;
  live?: boolean;
  hint?: string;
  className?: string;
  height?: number;
}> = ({ children, live = false, hint, className = '', height = 260 }) => (
  <div className="relative">
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        height,
        background: 'radial-gradient(ellipse 100% 80% at 50% 0%, var(--void-200), var(--void-000) 78%)',
        border: '1px solid rgba(176,108,255,0.24)',
        boxShadow: 'inset 0 2px 30px rgba(0,0,0,0.8), inset 0 0 40px -26px var(--cyan)',
      }}
    >
      {/* Tally */}
      <span className="absolute top-3 right-3 z-30 flex items-center gap-1.5 pointer-events-none">
        <span
          className="w-1.5 h-1.5 rounded-full transition-all duration-300"
          style={{
            background: live ? 'var(--lime)' : 'var(--violet-dim)',
            boxShadow: live ? '0 0 10px var(--lime)' : 'none',
          }}
        />
        <span className="font-pixel text-[10px] tracking-eyebrow" style={{ color: live ? 'var(--lime)' : 'var(--text-500)' }}>
          {live ? 'LIVE' : 'READY'}
        </span>
      </span>
      {children}
    </div>
    {hint && (
      <p className="mt-2.5 text-[11px] font-mono text-center" style={{ color: 'var(--text-500)' }}>
        {hint}
      </p>
    )}
  </div>
);

/** The one and only button style in previews. */
export const TriggerButton: React.FC<{
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  tone?: 'gold' | 'danger';
}> = ({ onClick, label, icon, tone = 'gold' }) => {
  const c = tone === 'danger' ? '#ff2d95' : '#00e5ff';
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-display text-[12.5px] uppercase tracking-wide transition-all duration-150 active:scale-[0.94] active:translate-y-px"
      style={{
        color: '#fff',
        background: `${c}1c`,
        border: `1px solid ${c}`,
        boxShadow: `0 0 22px -6px ${c}, inset 0 0 22px -14px ${c}`,
        textShadow: `0 0 10px ${c}`,
      }}
    >
      {icon ?? <Play size={12} />}
      {label}
    </button>
  );
};

/**
 * A miniature product UI to point effects at. Every CSS-filter easter egg
 * needs *something* to distort, and distorting a lone word doesn't read —
 * the eye needs a familiar layout to notice that it's been broken.
 */
export const SampleScene: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div
    className="w-full max-w-[300px] rounded-lg p-4 select-none"
    style={{ background: 'var(--void-200)', border: '1px solid rgba(176,108,255,0.24)' }}
  >
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-7 h-7 rounded-md shrink-0" style={{ background: 'linear-gradient(140deg, var(--cyan), var(--magenta))' }} />
      <div className="flex-1 min-w-0">
        <div className="h-2 rounded-full w-20 mb-1.5" style={{ background: 'rgba(255,255,255,0.22)' }} />
        <div className="h-1.5 rounded-full w-14" style={{ background: 'rgba(255,255,255,0.09)' }} />
      </div>
    </div>
    <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--text-300)' }}>
      Ship it on Friday. What could possibly go wrong?
    </p>
    {!compact && (
      <div className="flex gap-2">
        <span className="px-2.5 py-1 rounded text-[11px] font-semibold" style={{ background: 'var(--cyan)', color: 'var(--void-000)', boxShadow: '0 0 14px -3px var(--cyan)' }}>
          Deploy
        </span>
        <span className="px-2.5 py-1 rounded text-[11px]" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-300)' }}>
          Cancel
        </span>
      </div>
    )}
  </div>
);

/**
 * Applies a CSS filter or transform to <SampleScene/> on demand.
 * Covers roughly a third of the catalogue on its own.
 */
export const EffectStage: React.FC<{
  css: React.CSSProperties;
  label: string;
  hint?: string;
  duration?: number;      // ms; 0 = toggle, stays until pressed again
  transition?: string;
  sceneClassName?: string;
}> = ({ css, label, hint, duration = 0, transition = 'all 1.1s cubic-bezier(0.16,1,0.3,1)', sceneClassName }) => {
  const [on, setOn] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const fire = () => {
    if (duration > 0) {
      setOn(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOn(false), duration);
    } else {
      setOn((v) => !v);
    }
  };

  return (
    <Stage live={on} hint={hint}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-5">
        <div className={sceneClassName} style={{ transition, ...(on ? css : {}) }}>
          <SampleScene />
        </div>
        <TriggerButton onClick={fire} label={on && duration === 0 ? 'Reset' : label} icon={on && duration === 0 ? <RotateCcw size={12} /> : undefined} />
      </div>
    </Stage>
  );
};

/* ═══ Terminal ════════════════════════════════════════════════════════════ */

/**
 * A terminal that types. Character-by-character at ~9ms with a 260ms beat
 * between lines — fast enough not to test patience, slow enough that the
 * output feels produced rather than pasted.
 */
export const FauxTerminal: React.FC<{
  command: string;
  output: string[];
  color?: string;
  charDelay?: number;
  height?: number;
  loop?: boolean;
}> = ({ command, output, color = '#7cff4f', charDelay = 9, height = 260, loop = false }) => {
  const [typed, setTyped] = useState('');
  const [shown, setShown] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [runId, setRunId] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    setTyped('');
    setShown([]);
    setDone(false);

    const run = async () => {
      for (let i = 0; i <= command.length; i++) {
        if (cancelled) return;
        await new Promise<void>((r) => timers.push(window.setTimeout(r, charDelay * 3)));
        if (cancelled) return;
        setTyped(command.slice(0, i));
      }
      await new Promise<void>((r) => timers.push(window.setTimeout(r, 260)));
      for (let i = 0; i < output.length; i++) {
        if (cancelled) return;
        await new Promise<void>((r) => timers.push(window.setTimeout(r, 55)));
        if (cancelled) return;
        setShown((prev) => [...prev, output[i]]);
      }
      if (!cancelled) setDone(true);
      if (loop && !cancelled) {
        await new Promise<void>((r) => timers.push(window.setTimeout(r, 2600)));
        if (!cancelled) setRunId((n) => n + 1);
      }
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [command, output, charDelay, loop, runId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [shown]);

  return (
    <Stage live={!done} height={height}>
      <div ref={scrollRef} className="absolute inset-0 overflow-auto p-4 font-mono text-[11.5px] leading-[1.55]">
        <div className="flex gap-2">
          <span style={{ color: 'var(--cyan)' }}>$</span>
          <span style={{ color: 'var(--text-100)' }}>
            {typed}
            {typed.length < command.length && <span className="animate-caret">▊</span>}
          </span>
        </div>
        <pre className="whitespace-pre mt-1.5" style={{ color }}>
          {shown.join('\n')}
        </pre>
        {done && (
          <div className="flex gap-2 mt-1.5">
            <span style={{ color: 'var(--cyan)' }}>$</span>
            <span className="animate-caret" style={{ color: 'var(--text-100)' }}>▊</span>
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ═══ Console ═════════════════════════════════════════════════════════════ */

export const FauxConsole: React.FC<{
  entries: { text: string; style?: React.CSSProperties }[];
  header?: string;
}> = ({ entries, header = 'Console' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= entries.length) {
          window.clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 130);
    return () => window.clearInterval(id);
  }, [entries]);

  return (
    <Stage live={count < entries.length}>
      <div className="absolute inset-0 flex flex-col">
        <div
          className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}
        >
          <span className="text-[11px] font-mono tracking-wider uppercase" style={{ color: 'var(--text-500)' }}>
            ⌥⌘I — {header}
          </span>
        </div>
        <div className="flex-1 overflow-auto p-3 font-mono text-[11.5px] leading-[1.6]">
          {entries.slice(0, count).map((e, i) => (
            <motion.pre
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22 }}
              className="whitespace-pre-wrap break-words"
              style={{ color: 'var(--text-300)', ...e.style }}
            >
              {e.text}
            </motion.pre>
          ))}
        </div>
      </div>
    </Stage>
  );
};

/* ═══ Audio ═══════════════════════════════════════════════════════════════ */

/**
 * A tiny synth so the audio eggs can actually make a noise without shipping
 * an mp3. Lazily creates the AudioContext on first user gesture — browsers
 * refuse to start one before that, and creating it eagerly just leaves a
 * suspended context lying around.
 */
export const useSynth = () => {
  const ctxRef = useRef<AudioContext | null>(null);

  const ctx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback(
    (freq: number, dur = 0.12, type: OscillatorType = 'square', gain = 0.06, at = 0) => {
      const c = ctx();
      const t = c.currentTime + at;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      // A hard gate clicks. A 6ms attack and an exponential tail don't.
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(c.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },
    [ctx],
  );

  /** A falling, wobbling shriek. Not the real Wilhelm — an homage. */
  const scream = useCallback(() => {
    const c = ctx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const g = c.createGain();
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(760, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.85);
    lfo.frequency.value = 17;
    lfoGain.gain.value = 55;
    lfo.connect(lfoGain).connect(osc.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    osc.connect(g).connect(c.destination);
    osc.start(t); lfo.start(t);
    osc.stop(t + 0.95); lfo.stop(t + 0.95);
  }, [ctx]);

  const melody = useCallback(
    (notes: [number, number][], type: OscillatorType = 'triangle', gain = 0.05) => {
      let at = 0;
      notes.forEach(([f, d]) => {
        if (f > 0) tone(f, d * 0.92, type, gain, at);
        at += d;
      });
      return at;
    },
    [tone],
  );

  useEffect(() => () => { void ctxRef.current?.close(); }, []);

  return { tone, scream, melody };
};

/** Canvas host that hands you a 2D context sized to the element and DPR. */
export const CanvasStage: React.FC<{
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  height?: number;
  hint?: string;
  background?: string;
}> = ({ draw, height = 260, hint, background = 'transparent' }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let w = 0;
    let h = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const loop = (t: number) => {
      draw(ctx, w, h, t);
      raf = requestAnimationFrame(loop);
    };

    size();
    const ro = new ResizeObserver(size);
    ro.observe(canvas);

    if (reduced) draw(ctx, w, h, 0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [draw]);

  return (
    <Stage height={height} live hint={hint}>
      <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ background }} />
    </Stage>
  );
};

/** Fallback for the handful of eggs that genuinely can't be shown in a box. */
export const NoPreview: React.FC<{ reason?: string }> = ({ reason }) => (
  <Stage height={200}>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'rgba(176,108,255,0.12)', border: '1px solid rgba(176,108,255,0.3)' }}
      >
        <span className="text-[17px]">🥚</span>
      </div>
      <p className="text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-300)' }}>
        Best experienced in the wild
      </p>
      <p className="text-[11.5px] leading-relaxed max-w-[19rem]" style={{ color: 'var(--text-500)' }}>
        {reason ?? 'This one needs a real environment — copy the snippet and try it in your own project.'}
      </p>
    </div>
  </Stage>
);
