import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Zap, Skull, Power } from 'lucide-react';
import { Stage, TriggerButton, SampleScene, CanvasStage, useSynth } from './primitives';

/* ═══════════════════════════════════════════════════════════════════════════
   BESPOKE PREVIEWS
   Each of these is the actual effect, running, in a 260px box.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Konami ───────────────────────────────────────────────────────────────
   The real sequence, on a real keydown listener. Progress is shown as a row
   of glyphs so a user who doesn't know the code can still play along. */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const KONAMI_GLYPH = ['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'];

export const KonamiPreview: React.FC = () => {
  const [pos, setPos] = useState(0);
  const [won, setWon] = useState(false);
  const { melody } = useSynth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      setPos((p) => {
        if (key === KONAMI[p]) {
          const next = p + 1;
          if (next === KONAMI.length) {
            setWon(true);
            // 1-up jingle, roughly.
            melody([[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.22]], 'square', 0.05);
            setTimeout(() => setWon(false), 3200);
            return 0;
          }
          return next;
        }
        return key === KONAMI[0] ? 1 : 0;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [melody]);

  return (
    <Stage live={pos > 0 || won} hint="Click here first, then type the code on your keyboard">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <AnimatePresence mode="wait">
          {won ? (
            <motion.div
              key="won"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              className="text-center"
            >
              <p className="font-display text-2xl tracking-title" style={{ color: '#fff', textShadow: '0 0 6px #fff, 0 0 22px var(--lime), 0 0 48px var(--lime)' }}>30 LIVES</p>
              <p className="mt-2 text-[11px] font-mono" style={{ color: 'var(--text-400)' }}>
                Contra, 1988. Still works.
              </p>
            </motion.div>
          ) : (
            <motion.div key="keys" className="flex flex-wrap justify-center gap-1.5 px-6" exit={{ opacity: 0 }}>
              {KONAMI_GLYPH.map((g, i) => (
                <span
                  key={i}
                  className="flex items-center justify-center w-8 h-9 rounded-md text-[13px] font-mono font-semibold transition-all duration-200"
                  style={{
                    color: i < pos ? 'var(--void-000)' : 'var(--text-500)',
                    background: i < pos ? 'var(--cyan)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${i < pos ? 'var(--cyan)' : 'rgba(255,255,255,0.07)'}`,
                    boxShadow: i < pos ? '0 0 14px -4px var(--cyan)' : 'none',
                    transform: i < pos ? 'translateY(-2px)' : 'none',
                  }}
                >
                  {g}
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
};

/* ── Confetti ─────────────────────────────────────────────────────────────
   Hand-rolled rather than react-confetti so the palette stays in the grade
   and the pieces get real rotation on two axes. */
interface Piece { x: number; y: number; vx: number; vy: number; rot: number; vr: number; w: number; h: number; c: string; life: number; }

export const ConfettiPreview: React.FC = () => {
  const piecesRef = useRef<Piece[]>([]);
  // The cannon needs to know how wide the stage actually is — the preview
  // column is a fraction of a responsive panel, so hard-coding the origin
  // puts the burst off to one side on anything but a phone.
  const sizeRef = useRef({ w: 300, h: 260 });
  const [burst, setBurst] = useState(0);
  const { tone } = useSynth();

  const PALETTE = ['#00e5ff', '#ff2d95', '#ffd23f', '#7cff4f', '#b06cff', '#ffffff'];

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    sizeRef.current = { w, h };
    ctx.clearRect(0, 0, w, h);
    const alive: Piece[] = [];
    for (const p of piecesRef.current) {
      p.vy += 0.16;          // gravity
      p.vx *= 0.995;         // drag
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 1;
      if (p.y < h + 30 && p.life > 0) alive.push(p);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      // Squashing width by cos(rot) fakes a flat sheet tumbling in 3D.
      ctx.scale(Math.cos(p.rot * 1.6), 1);
      ctx.globalAlpha = Math.min(1, p.life / 40);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    piecesRef.current = alive;
  }, []);

  const fire = () => {
    const { w, h } = sizeRef.current;
    const next: Piece[] = [];
    for (let i = 0; i < 130; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.7;
      const s = 4 + Math.random() * 9;
      next.push({
        x: w / 2 + (Math.random() - 0.5) * 40,
        y: h - 30,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.32,
        w: 4 + Math.random() * 5,
        h: 7 + Math.random() * 6,
        c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        life: 130 + Math.random() * 70,
      });
    }
    piecesRef.current = [...piecesRef.current, ...next];
    tone(880, 0.06, 'square', 0.04);
    tone(1320, 0.09, 'square', 0.03, 0.05);
    setBurst((b) => b + 1);
  };

  return (
    <div className="relative">
      <CanvasStage draw={draw} height={260} />
      <div className="absolute inset-x-0 bottom-5 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <TriggerButton onClick={fire} label={burst ? 'Again' : 'Celebrate'} icon={<Zap size={12} />} />
        </div>
      </div>
    </div>
  );
};

/* ── DVD bouncer ──────────────────────────────────────────────────────── */
export const DVDPreview: React.FC = () => {
  const state = useRef({ x: 40, y: 40, vx: 1.5, vy: 1.05, hue: 0, corners: 0 });
  const [corners, setCorners] = useState(0);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const s = state.current;
    const bw = 66;
    const bh = 30;
    ctx.clearRect(0, 0, w, h);

    s.x += s.vx;
    s.y += s.vy;

    let hitX = false;
    let hitY = false;
    if (s.x <= 0 || s.x + bw >= w) { s.vx *= -1; s.x = Math.max(0, Math.min(s.x, w - bw)); hitX = true; }
    if (s.y <= 0 || s.y + bh >= h) { s.vy *= -1; s.y = Math.max(0, Math.min(s.y, h - bh)); hitY = true; }
    if (hitX || hitY) s.hue = (s.hue + 47) % 360;
    // The whole point of the DVD logo.
    if (hitX && hitY) { s.corners += 1; setCorners(s.corners); }

    ctx.save();
    ctx.fillStyle = `hsl(${s.hue}, 62%, 62%)`;
    ctx.shadowColor = `hsl(${s.hue}, 70%, 55%)`;
    ctx.shadowBlur = 18;
    ctx.font = 'italic 700 21px Georgia, serif';
    ctx.textBaseline = 'top';
    ctx.fillText('DVD', s.x + 6, s.y + 3);
    ctx.font = '9px monospace';
    ctx.fillText('V I D E O', s.x + 8, s.y + 22);
    ctx.restore();
  }, []);

  return (
    <CanvasStage
      draw={draw}
      height={260}
      hint={corners > 0 ? `${corners} perfect corner hit${corners > 1 ? 's' : ''} — you saw it happen` : 'Waiting for the corner…'}
    />
  );
};

/* ── Warp speed starfield ─────────────────────────────────────────────── */
export const StarfieldPreview: React.FC = () => {
  const stars = useRef<{ x: number; y: number; z: number; pz: number }[]>([]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (stars.current.length === 0) {
      stars.current = Array.from({ length: 320 }, () => ({
        x: (Math.random() - 0.5) * w * 2,
        y: (Math.random() - 0.5) * h * 2,
        z: Math.random() * w,
        pz: 0,
      }));
      stars.current.forEach((s) => { s.pz = s.z; });
    }

    // Trail persistence instead of clearRect. The streaks ARE the effect —
    // a hard clear each frame gives you dots, not warp.
    ctx.fillStyle = 'rgba(6, 4, 15, 0.32)';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2, h / 2);
    for (const s of stars.current) {
      s.pz = s.z;
      s.z -= 9;
      if (s.z < 1) {
        s.z = w;
        s.x = (Math.random() - 0.5) * w * 2;
        s.y = (Math.random() - 0.5) * h * 2;
        s.pz = s.z;
      }
      const sx = (s.x / s.z) * (w / 2);
      const sy = (s.y / s.z) * (w / 2);
      const px = (s.x / s.pz) * (w / 2);
      const py = (s.y / s.pz) * (w / 2);
      const near = 1 - s.z / w;
      ctx.strokeStyle = `rgba(${230 + near * 25}, ${210 + near * 40}, ${170 + near * 80}, ${0.25 + near * 0.75})`;
      ctx.lineWidth = 0.4 + near * 1.9;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }
    ctx.restore();
  }, []);

  return <CanvasStage draw={draw} height={260} background="#06040f" hint="Engage." />;
};

/* ── Matrix rain ──────────────────────────────────────────────────────── */
export const MatrixPreview: React.FC = () => {
  const cols = useRef<number[]>([]);
  const glyphs = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789';

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const size = 13;
    const n = Math.floor(w / size);
    if (cols.current.length !== n) cols.current = Array.from({ length: n }, () => Math.random() * -30);

    ctx.fillStyle = 'rgba(6, 4, 15, 0.09)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = `${size}px monospace`;

    cols.current.forEach((y, i) => {
      const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
      // The head of each column is near-white; the tail is green. That
      // brightness gradient is what makes it read as falling.
      ctx.fillStyle = '#d8f0dd';
      ctx.fillText(ch, i * size, y * size);
      ctx.fillStyle = 'rgba(133, 191, 154, 0.75)';
      ctx.fillText(glyphs[Math.floor(Math.random() * glyphs.length)], i * size, (y - 1) * size);

      cols.current[i] = y * size > h && Math.random() > 0.975 ? 0 : y + 1;
    });
  }, []);

  return <CanvasStage draw={draw} height={260} background="#06040f" hint="Wake up, Neo." />;
};

/* ── AAFire ────────────────────────────────────────────────────────────
   The Doom fire algorithm: a hot row along the bottom, each cell above
   sampling the one below it minus a random decay, with a horizontal jitter.
   Thirty lines of code and it still looks better than most particle fire. */
export const FirePreview: React.FC = () => {
  const buf = useRef<Uint8Array | null>(null);
  const dims = useRef({ cols: 0, rows: 0 });

  const PALETTE = useMemo(
    () => ['#06040f', '#3b1046', '#6b1250', '#a81b60', '#ff2d95', '#ff6b3d', '#ffa42e', '#ffd23f', '#ffeea8', '#ffffff'],
    [],
  );

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const cw = 6;
    const chh = 8;
    const cols = Math.max(1, Math.floor(w / cw));
    const rows = Math.max(1, Math.floor(h / chh));

    if (!buf.current || dims.current.cols !== cols || dims.current.rows !== rows) {
      buf.current = new Uint8Array(cols * rows);
      dims.current = { cols, rows };
      for (let x = 0; x < cols; x++) buf.current[(rows - 1) * cols + x] = 9;
    }
    const b = buf.current;

    // Propagate upward: each cell takes the value of the one below it, minus
    // a random decay, shifted sideways by that same decay. The sideways shift
    // is what makes the flame lean and flicker — without it you get a static
    // vertical gradient.
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols; x++) {
        const src = (y + 1) * cols + x;
        const decay = Math.floor(Math.random() * 3);
        const dstX = Math.max(0, Math.min(cols - 1, x - decay + 1));
        b[y * cols + dstX] = Math.max(0, b[src] - (decay & 1));
      }
    }

    ctx.clearRect(0, 0, w, h);
    ctx.font = `${chh}px monospace`;
    ctx.textBaseline = 'top';
    const chars = ' .:-=+*#%@';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const v = b[y * cols + x];
        if (v <= 0) continue;
        ctx.fillStyle = PALETTE[v];
        ctx.fillText(chars[v], x * cw, y * chh);
      }
    }
  }, [PALETTE]);

  return <CanvasStage draw={draw} height={260} background="#06040f" hint="aafire — ASCII art fire, 1997" />;
};

/* ── Pacman loader ────────────────────────────────────────────────────── */
export const PacmanPreview: React.FC = () => (
  <Stage live hint="A loading spinner with an appetite">
    <div className="absolute inset-0 flex items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: [0, -4, 0, 4, 0] }}
        transition={{ duration: 0.42, repeat: Infinity, ease: 'linear' }}
        className="relative w-12 h-12"
      >
        <motion.span
          className="absolute inset-0"
          style={{ background: 'var(--cyan)', borderRadius: '50%', clipPath: 'polygon(100% 0, 50% 50%, 100% 100%, 0 100%, 0 0)' }}
          animate={{ clipPath: [
            'polygon(100% 12%, 50% 50%, 100% 88%, 0 100%, 0 0)',
            'polygon(100% 48%, 50% 50%, 100% 52%, 0 100%, 0 0)',
            'polygon(100% 12%, 50% 50%, 100% 88%, 0 100%, 0 0)',
          ] }}
          transition={{ duration: 0.42, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="absolute w-1.5 h-1.5 rounded-full" style={{ background: 'var(--void-000)', top: '24%', left: '42%' }} />
      </motion.div>

      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: 'var(--cyan)' }}
          animate={{ x: [0, -68], opacity: [1, 1, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'linear', delay: i * 0.425 }}
        />
      ))}
    </div>
  </Stage>
);

/* ── Hacker typer ─────────────────────────────────────────────────────── */
const HACKER_SOURCE = `static int kprobe_handler(struct kprobe *p, struct pt_regs *regs) {
  struct kprobe_ctlblk *kcb = get_kprobe_ctlblk();
  unsigned long addr = regs->ip - sizeof(kprobe_opcode_t);
  if (unlikely(!p)) { reset_current_kprobe(); return 0; }
  kcb->kprobe_status = KPROBE_HIT_ACTIVE;
  set_current_kprobe(p, regs, kcb);
  if (p->pre_handler && p->pre_handler(p, regs)) return 1;
  prepare_singlestep(p, regs, kcb);
  return 1;
}
void __kprobes arch_arm_kprobe(struct kprobe *p) {
  text_poke(p->addr, ((unsigned char []){BREAKPOINT_INSTRUCTION}), 1);
}`;

export const HackerTyperPreview: React.FC = () => {
  const [n, setN] = useState(0);
  const [touched, setTouched] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') return;
    e.preventDefault();
    setTouched(true);
    // Three characters per keypress. The whole trick.
    setN((v) => Math.min(HACKER_SOURCE.length, v + 3));
  };

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [n]);

  return (
    <Stage live={touched} hint="Click the panel, then mash any keys">
      <div
        ref={boxRef}
        tabIndex={0}
        onKeyDown={onKey}
        role="textbox"
        aria-label="Hacker typer demo — press keys to reveal code"
        className="absolute inset-0 overflow-auto p-4 font-mono text-[11px] leading-[1.6] cursor-text outline-none"
        style={{ color: '#7cff4f' }}
      >
        {n === 0 && (
          <p style={{ color: 'var(--text-500)' }}>{'// click here and start mashing'}</p>
        )}
        <pre className="whitespace-pre-wrap break-all">
          {HACKER_SOURCE.slice(0, n)}
          <span className="animate-caret">▊</span>
        </pre>
      </div>
    </Stage>
  );
};

/* ── T-Rex runner — actually playable ─────────────────────────────────── */
export const TRexPreview: React.FC = () => {
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [dead, setDead] = useState(false);
  const g = useRef({
    y: 0, vy: 0, jumping: false, obstacles: [] as { x: number; w: number; h: number }[],
    t: 0, speed: 3.4, score: 0, dead: false, spawn: 60,
  });

  const jump = useCallback(() => {
    const s = g.current;
    if (s.dead) {
      s.dead = false; s.obstacles = []; s.score = 0; s.speed = 3.4; s.y = 0; s.vy = 0;
      setDead(false); setScore(0);
      return;
    }
    if (!s.jumping) { s.vy = -8.2; s.jumping = true; }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); jump(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const s = g.current;
    const ground = h - 42;
    ctx.clearRect(0, 0, w, h);

    if (!s.dead) {
      s.t += 1;
      s.speed += 0.0016;
      s.vy += 0.46;
      s.y = Math.min(0, s.y + s.vy);
      if (s.y === 0) s.jumping = false;

      s.spawn -= 1;
      if (s.spawn <= 0) {
        s.obstacles.push({ x: w + 20, w: 9 + Math.random() * 9, h: 17 + Math.random() * 17 });
        // Gap scales inversely with speed so it stays clearable.
        s.spawn = Math.max(38, 96 - s.speed * 7 + Math.random() * 46);
      }
      s.obstacles = s.obstacles.filter((o) => o.x > -30);
      s.obstacles.forEach((o) => { o.x -= s.speed; });
      s.score += 1;
      if (s.score % 3 === 0) setScore(Math.floor(s.score / 3));

      const dinoX = 34;
      const dinoW = 20;
      const dinoH = 24;
      for (const o of s.obstacles) {
        // 3px of forgiveness on each side. Pixel-exact hitboxes feel unfair.
        if (o.x < dinoX + dinoW - 3 && o.x + o.w > dinoX + 3 && s.y + dinoH > -o.h + 3) {
          s.dead = true;
          setDead(true);
          setBest((b) => Math.max(b, Math.floor(s.score / 3)));
        }
      }
    }

    // Ground
    ctx.strokeStyle = 'rgba(187,181,217,0.40)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, ground + 0.5);
    ctx.lineTo(w, ground + 0.5);
    ctx.stroke();

    // Speckle on the ground so motion is visible even between obstacles.
    ctx.fillStyle = 'rgba(187,181,217,0.26)';
    for (let i = 0; i < 14; i++) {
      const x = ((i * 97 - s.t * s.speed) % (w + 60) + w + 60) % (w + 60) - 30;
      ctx.fillRect(x, ground + 5 + (i % 3) * 4, 3, 1);
    }

    // Dino
    // Canvas takes literals only — a CSS var here silently no-ops.
    ctx.fillStyle = s.dead ? '#ff6b6b' : '#e8e4ff';
    const dy = ground - 24 + s.y;
    ctx.fillRect(34, dy, 20, 24);
    ctx.fillRect(50, dy - 6, 11, 9);
    ctx.fillStyle = '#06040f';
    ctx.fillRect(56, dy - 4, 2, 2);
    if (!s.jumping && !s.dead && Math.floor(s.t / 6) % 2 === 0) {
      ctx.fillStyle = '#e8e4ff';
      ctx.fillRect(36, dy + 24, 5, 4);
    } else if (!s.dead) {
      ctx.fillStyle = '#e8e4ff';
      ctx.fillRect(46, dy + 24, 5, 4);
    }

    // Cacti
    ctx.fillStyle = '#7cff4f';
    for (const o of s.obstacles) ctx.fillRect(o.x, ground - o.h, o.w, o.h);
  }, []);

  return (
    <div className="relative">
      <CanvasStage draw={draw} height={260} hint="Space or ↑ to jump · click the box first" />
      <div className="absolute top-3 left-4 z-30 font-mono text-[11px] pointer-events-none" style={{ color: 'var(--text-400)' }}>
        {String(score).padStart(5, '0')}
        {best > 0 && <span style={{ color: 'var(--text-500)' }}>  HI {String(best).padStart(5, '0')}</span>}
      </div>
      {dead && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <button
            onClick={jump}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold"
            style={{ background: 'rgba(5,5,6,0.85)', color: 'var(--cyan)', border: '1px solid rgba(217,164,65,0.3)' }}
          >
            G A M E  O V E R — retry
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Pong, playing itself in the title bar ────────────────────────────── */
export const PongPreview: React.FC = () => {
  const s = useRef({ x: 60, y: 20, vx: 2.1, vy: 1.35, p1: 14, p2: 14, l: 0, r: 0 });
  const [scores, setScores] = useState<[number, number]>([0, 0]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const st = s.current;
    const ph = 34;
    const pad = 6;
    ctx.clearRect(0, 0, w, h);

    st.x += st.vx;
    st.y += st.vy;
    if (st.y <= 2 || st.y >= h - 2) st.vy *= -1;

    // The AI tracks with lag and a deliberate error term, otherwise it never
    // misses and the rally never ends.
    const track = (p: number) => p + Math.max(-2.4, Math.min(2.4, (st.y - ph / 2 - p) * 0.09));
    st.p1 = Math.max(0, Math.min(h - ph, track(st.p1)));
    st.p2 = Math.max(0, Math.min(h - ph, track(st.p2) + Math.sin(st.x * 0.05) * 1.1));

    if (st.x <= pad + 5 && st.y > st.p1 && st.y < st.p1 + ph) { st.vx = Math.abs(st.vx) * 1.02; }
    if (st.x >= w - pad - 5 && st.y > st.p2 && st.y < st.p2 + ph) { st.vx = -Math.abs(st.vx) * 1.02; }
    if (st.x < 0) { st.r += 1; setScores([st.l, st.r]); st.x = w / 2; st.y = h / 2; st.vx = 2.1; }
    if (st.x > w) { st.l += 1; setScores([st.l, st.r]); st.x = w / 2; st.y = h / 2; st.vx = -2.1; }

    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.setLineDash([4, 7]);
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#e8e4ff';
    ctx.fillRect(pad, st.p1, 3, ph);
    ctx.fillRect(w - pad - 3, st.p2, 3, ph);
    ctx.fillStyle = '#00e5ff';
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 9;
    ctx.fillRect(st.x - 2, st.y - 2, 4, 4);
    ctx.shadowBlur = 0;
  }, []);

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-2.5 pointer-events-none">
        <span className="font-mono text-[11px]" style={{ color: 'var(--text-500)' }}>
          {scores[0]} — {scores[1]}
        </span>
      </div>
      <CanvasStage draw={draw} height={130} hint="It plays in your browser tab title. Yes, really." />
    </div>
  );
};

/* ── Zerg rush ────────────────────────────────────────────────────────── */
export const ZergPreview: React.FC = () => {
  const [zergs, setZergs] = useState<{ id: number; x: number; y: number; hp: number }[]>([]);
  const [killed, setKilled] = useState(0);
  const [running, setRunning] = useState(false);
  const { tone } = useSynth();
  const nid = useRef(0);

  useEffect(() => {
    if (!running) return;
    const spawn = window.setInterval(() => {
      setZergs((z) => (z.length > 22 ? z : [...z, { id: nid.current++, x: Math.random() * 88 + 3, y: -8, hp: 2 }]));
    }, 340);
    const move = window.setInterval(() => {
      setZergs((z) => z.map((o) => ({ ...o, y: o.y + 1.5 })).filter((o) => o.y < 108));
    }, 45);
    return () => { window.clearInterval(spawn); window.clearInterval(move); };
  }, [running]);

  const hit = (id: number) => {
    tone(200 + Math.random() * 120, 0.05, 'square', 0.035);
    setZergs((z) =>
      z.flatMap((o) => {
        if (o.id !== id) return [o];
        if (o.hp <= 1) { setKilled((k) => k + 1); return []; }
        return [{ ...o, hp: o.hp - 1 }];
      }),
    );
  };

  return (
    <Stage live={running} hint={running ? `${killed} destroyed — click the o's` : 'They eat the page. All of it.'}>
      <div className="absolute inset-0">
        {zergs.map((z) => (
          <button
            key={z.id}
            onClick={() => hit(z.id)}
            className="absolute font-mono font-bold leading-none transition-transform hover:scale-125"
            style={{
              left: `${z.x}%`,
              top: `${z.y}%`,
              fontSize: 15,
              color: z.hp > 1 ? '#ff2d95' : '#ffd23f',
              textShadow: '0 0 8px currentColor',
            }}
            aria-label="Destroy zergling"
          >
            o
          </button>
        ))}
        {!running && (
          <div className="absolute inset-0 flex items-center justify-center">
            <TriggerButton onClick={() => setRunning(true)} label="Zerg rush" icon={<Skull size={12} />} tone="danger" />
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ── Thanos snap ──────────────────────────────────────────────────────── */
export const ThanosPreview: React.FC = () => {
  const [gone, setGone] = useState(false);

  return (
    <Stage live={gone} hint={gone ? 'Perfectly balanced.' : 'Half of everything. At random.'}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-5">
        <div className="relative">
          <motion.div
            animate={gone ? { opacity: 0, filter: 'blur(9px)', scale: 1.12, y: -14 } : { opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <SampleScene compact />
          </motion.div>

          {/* The dust. Particles drift up and right, staggered by their x
              position — so the object appears to disintegrate from one corner
              rather than all at once. */}
          {gone &&
            Array.from({ length: 46 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-[2.5px] h-[2.5px] rounded-full"
                style={{ background: i % 3 === 0 ? 'var(--cyan)' : 'var(--text-300)', left: `${(i * 13) % 96}%`, top: `${(i * 29) % 88}%` }}
                initial={{ opacity: 0.9, x: 0, y: 0 }}
                animate={{ opacity: 0, x: 30 + Math.random() * 55, y: -40 - Math.random() * 55 }}
                transition={{ duration: 1.5 + Math.random() * 0.9, delay: ((i * 13) % 96) / 190, ease: 'easeOut' }}
              />
            ))}
        </div>
        <TriggerButton onClick={() => setGone((v) => !v)} label={gone ? 'Undo the snap' : 'Snap'} tone="danger" />
      </div>
    </Stage>
  );
};

/* ── Lightsaber cursor ────────────────────────────────────────────────── */
export const LightsaberPreview: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const trail = useRef<{ x: number; y: number; t: number }[]>([]);
  const [hue, setHue] = useState(140);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h);
    const now = performance.now();
    trail.current = trail.current.filter((p) => now - p.t < 420);
    if (trail.current.length < 2) return;

    // Two passes: a wide soft bloom, then a hot white core. A single stroke
    // never reads as a plasma blade — it's the core-inside-glow that does it.
    for (const [width, alpha, color] of [[16, 0.20, `hsl(${hue},90%,55%)`], [7, 0.55, `hsl(${hue},90%,65%)`], [2.5, 1, '#ffffff']] as const) {
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.shadowColor = `hsl(${hue},90%,60%)`;
      ctx.shadowBlur = width * 1.6;
      trail.current.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }, [hue]);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        trail.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
        if (trail.current.length > 34) trail.current.shift();
      }}
      className="relative cursor-crosshair"
    >
      <CanvasStage draw={draw} height={260} hint="Move your pointer across the panel" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {[140, 210, 0, 275].map((hu) => (
          <button
            key={hu}
            onClick={() => setHue(hu)}
            aria-label={`Blade colour ${hu}`}
            className="w-5 h-5 rounded-full transition-transform hover:scale-125"
            style={{
              background: `hsl(${hu},85%,58%)`,
              boxShadow: hue === hu ? `0 0 12px hsl(${hu},85%,58%)` : 'none',
              outline: hue === hu ? '1px solid rgba(255,255,255,0.6)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ── Oneko — the cat that chases your cursor ──────────────────────────── */
export const OnekoPreview: React.FC = () => {
  const [cat, setCat] = useState({ x: 60, y: 120 });
  const target = useRef({ x: 150, y: 130 });
  const [sleeping, setSleeping] = useState(true);

  useEffect(() => {
    let raf = 0;
    let still = 0;
    const tick = () => {
      setCat((c) => {
        const dx = target.current.x - c.x;
        const dy = target.current.y - c.y;
        const d = Math.hypot(dx, dy);
        if (d < 26) {
          still += 1;
          if (still > 90) setSleeping(true);
          return c;
        }
        still = 0;
        setSleeping(false);
        const speed = Math.min(3.4, d * 0.09);
        return { x: c.x + (dx / d) * speed, y: c.y + (dy / d) * speed };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Stage live={!sleeping} hint="A 1989 Macintosh desk accessory, ported everywhere">
      <div
        className="absolute inset-0"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
        }}
      >
        <div
          className="absolute select-none pointer-events-none transition-transform"
          style={{ left: cat.x - 14, top: cat.y - 14, fontSize: 26, lineHeight: 1 }}
        >
          {sleeping ? '😴' : '🐈'}
        </div>
        {!sleeping && (
          <div
            className="absolute w-2 h-2 rounded-full pointer-events-none"
            style={{ left: target.current.x - 4, top: target.current.y - 4, background: 'rgba(217,164,65,0.4)' }}
          />
        )}
      </div>
    </Stage>
  );
};

/* ── Xeyes ────────────────────────────────────────────────────────────── */
export const XeyesPreview: React.FC = () => {
  const [p, setP] = useState({ x: 0.5, y: 0.5 });

  const pupil = (cx: number) => {
    const dx = (p.x - cx) * 2;
    const dy = (p.y - 0.5) * 2;
    const d = Math.min(1, Math.hypot(dx, dy));
    const a = Math.atan2(dy, dx);
    return { x: Math.cos(a) * d * 13, y: Math.sin(a) * d * 15 };
  };

  const l = pupil(0.42);
  const r = pupil(0.58);

  return (
    <Stage live hint="X11, 1988. Still shipped with every Linux distro.">
      <div
        className="absolute inset-0 flex items-center justify-center gap-4"
        onMouseMove={(e) => {
          const b = e.currentTarget.getBoundingClientRect();
          setP({ x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height });
        }}
      >
        {[l, r].map((eye, i) => (
          <svg key={i} width="72" height="96" viewBox="0 0 72 96">
            <ellipse cx="36" cy="48" rx="33" ry="45" fill="#100a24" stroke="#e8e4ff" strokeWidth="3" />
            <ellipse cx={36 + eye.x} cy={48 + eye.y} rx="11" ry="13" fill="#e8e4ff" />
            <ellipse cx={36 + eye.x - 3} cy={48 + eye.y - 5} rx="3" ry="3.5" fill="#ffffff" opacity="0.9" />
          </svg>
        ))}
      </div>
    </Stage>
  );
};

/* ── Custom context menu ──────────────────────────────────────────────── */
export const ContextMenuPreview: React.FC = () => {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const items = ['🔮 Read the future', '🎩 Pull a rabbit', '🥚 Find an egg', '☕ Refill coffee'];

  return (
    <Stage live={!!menu} hint="Right-click inside the panel">
      <div
        className="absolute inset-0"
        onContextMenu={(e) => {
          e.preventDefault();
          const r = e.currentTarget.getBoundingClientRect();
          setMenu({ x: Math.min(e.clientX - r.left, r.width - 170), y: Math.min(e.clientY - r.top, r.height - 140) });
        }}
        onClick={() => setMenu(null)}
      >
        {!menu && (
          <p className="absolute inset-0 flex items-center justify-center text-[12px] font-mono" style={{ color: 'var(--text-500)' }}>
            right-click anywhere
          </p>
        )}
        <AnimatePresence>
          {menu && (
            <motion.ul
              initial={{ opacity: 0, scale: 0.92, originX: 0, originY: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-[165px] rounded-lg overflow-hidden py-1"
              style={{
                left: menu.x, top: menu.y,
                background: 'rgba(11,11,14,0.97)',
                border: '1px solid rgba(217,164,65,0.22)',
                boxShadow: '0 14px 40px -12px rgba(0,0,0,0.95)',
              }}
            >
              {items.map((it) => (
                <li key={it}>
                  <button
                    className="w-full text-left px-3 py-1.5 text-[12px] transition-colors hover:bg-[rgba(217,164,65,0.12)]"
                    style={{ color: 'var(--text-200)' }}
                  >
                    {it}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
};

/* ── Nyan cat ─────────────────────────────────────────────────────────── */
export const NyanPreview: React.FC = () => {
  const RAINBOW = ['#ff3b3b', '#ff9a2e', '#ffd23f', '#7cff4f', '#00e5ff', '#b06cff'];

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.clearRect(0, 0, w, h);
    const x = ((t / 12) % (w + 120)) - 60;
    const y = h / 2 + Math.sin(t / 260) * 26;
    const band = 5;

    // Rainbow, drawn as a stepped ribbon — the vertical offset per segment is
    // what gives it that 8-bit undulation instead of a smooth sine.
    for (let i = 0; i < 40; i++) {
      const sx = x - i * 9;
      if (sx < -20) break;
      const sy = h / 2 + Math.sin((t - i * 22) / 260) * 26;
      RAINBOW.forEach((c, k) => {
        ctx.fillStyle = c;
        ctx.fillRect(sx - 9, sy - 15 + k * band, 10, band);
      });
    }

    ctx.font = '26px serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐱', x, y);
  }, []);

  return <CanvasStage draw={draw} height={260} hint="Pop-tart body optional" />;
};

/* ── BSOD ─────────────────────────────────────────────────────────────── */
export const BSODPreview: React.FC = () => {
  const [on, setOn] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!on) { setPct(0); return; }
    const id = window.setInterval(() => setPct((p) => (p >= 100 ? 100 : p + Math.ceil(Math.random() * 7))), 320);
    return () => window.clearInterval(id);
  }, [on]);

  return (
    <Stage live={on}>
      <AnimatePresence mode="wait">
        {on ? (
          <motion.div
            key="bsod"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
            onClick={() => setOn(false)}
            className="absolute inset-0 flex flex-col justify-center px-8 cursor-pointer"
            style={{ background: '#1c4a8a', color: '#fff' }}
          >
            <p className="text-[42px] leading-none mb-4" style={{ fontFamily: 'Segoe UI, Inter, sans-serif' }}>{':('}</p>
            <p className="text-[13px] leading-relaxed mb-3" style={{ fontFamily: 'Segoe UI, Inter, sans-serif' }}>
              Your PC ran into a problem and needs to restart.
            </p>
            <p className="text-[12px] opacity-90 mb-4">{pct}% complete</p>
            <p className="text-[11px] font-mono opacity-70">Stop code: EASTER_EGG_NOT_FOUND</p>
            <p className="mt-4 text-[11px] opacity-50">{'(click to dismiss — it isn’t real)'}</p>
          </motion.div>
        ) : (
          <motion.div key="idle" className="absolute inset-0 flex flex-col items-center justify-center gap-5" exit={{ opacity: 0 }}>
            <SampleScene compact />
            <TriggerButton onClick={() => setOn(true)} label="Crash it" icon={<Power size={12} />} tone="danger" />
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
};

/* ── Fake update ──────────────────────────────────────────────────────── */
export const FakeUpdatePreview: React.FC = () => {
  const [on, setOn] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!on) { setPct(0); return; }
    // Stalls at 27%, then at 63%, then at 99%. Anyone who has ever waited on
    // Windows Update knows exactly which numbers to stall on.
    const id = window.setInterval(() => {
      setPct((p) => {
        if (p === 27 || p === 63) return Math.random() > 0.85 ? p + 1 : p;
        if (p >= 99) return 99;
        return p + 1;
      });
    }, 130);
    return () => window.clearInterval(id);
  }, [on]);

  return (
    <Stage live={on}>
      <AnimatePresence mode="wait">
        {on ? (
          <motion.div
            key="upd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOn(false)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-6 cursor-pointer"
            style={{ background: '#0a4f7a', color: '#fff' }}
          >
            <div
              className="w-11 h-11 rounded-full"
              style={{
                border: '3px solid rgba(255,255,255,0.22)',
                borderTopColor: '#fff',
                animation: 'spin-slow 1s linear infinite',
              }}
            />
            <div className="text-center">
              <p className="text-[15px] mb-1.5" style={{ fontFamily: 'Segoe UI, Inter, sans-serif' }}>
                Working on updates {pct}%
              </p>
              <p className="text-[12px] opacity-80">{'Don’t turn off your computer'}</p>
            </div>
            <p className="text-[11px] opacity-50 absolute bottom-4">(click to escape)</p>
          </motion.div>
        ) : (
          <motion.div key="idle" className="absolute inset-0 flex items-center justify-center" exit={{ opacity: 0 }}>
            <TriggerButton onClick={() => setOn(true)} label="Start 'update'" tone="danger" />
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
};

/* ── Self destruct ────────────────────────────────────────────────────── */
export const SelfDestructPreview: React.FC = () => {
  const [n, setN] = useState<number | null>(null);
  const { tone } = useSynth();

  useEffect(() => {
    if (n === null) return;
    if (n === 0) {
      tone(90, 0.6, 'sawtooth', 0.08);
      const id = window.setTimeout(() => setN(null), 2400);
      return () => window.clearTimeout(id);
    }
    tone(660, 0.07, 'square', 0.04);
    const id = window.setTimeout(() => setN((v) => (v === null ? null : v - 1)), 900);
    return () => window.clearTimeout(id);
  }, [n, tone]);

  const detonated = n === 0;

  return (
    <Stage live={n !== null}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        {n === null ? (
          <TriggerButton onClick={() => setN(5)} label="Initiate self destruct" tone="danger" />
        ) : detonated ? (
          <motion.p
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: [0.3, 1.3, 1], opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-display text-[26px] tracking-title"
            style={{ color: '#ff6b6b', textShadow: '0 0 30px #ff6b6b' }}
          >
            💥 BOOM
          </motion.p>
        ) : (
          <motion.p
            key={n}
            initial={{ scale: 1.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-display text-[64px] leading-none"
            style={{ color: '#ff6b6b', textShadow: '0 0 40px rgba(255,107,107,0.6)' }}
          >
            {n}
          </motion.p>
        )}
      </div>
    </Stage>
  );
};

/* ── Clippy ───────────────────────────────────────────────────────────── */
export const ClippyPreview: React.FC = () => {
  const LINES = [
    'It looks like you\'re writing a résumé. Want help?',
    'It looks like you\'re debugging at 2am. Have you tried sleeping?',
    'It looks like you\'re about to force-push to main.',
    'It looks like you\'re reading an easter egg gallery instead of working.',
  ];
  const [i, setI] = useState(0);

  return (
    <Stage live hint="Microsoft Office, 1997–2001. Never forgotten.">
      <div className="absolute inset-0 flex items-end justify-end p-6 gap-3">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-[200px] rounded-xl p-3.5 text-[12px] leading-relaxed"
          style={{ background: '#fdf6d8', color: '#2c2410', border: '1px solid #c9b47a' }}
        >
          {LINES[i]}
          <button
            onClick={() => setI((v) => (v + 1) % LINES.length)}
            className="mt-2.5 block text-[11px] font-semibold underline"
            style={{ color: '#8a631f' }}
          >
            No thanks →
          </button>
          <span
            className="absolute -bottom-[7px] right-7 w-3 h-3 rotate-45"
            style={{ background: '#fdf6d8', borderRight: '1px solid #c9b47a', borderBottom: '1px solid #c9b47a' }}
          />
        </motion.div>
        <motion.span
          animate={{ rotate: [0, -7, 0, 7, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="text-[34px] select-none"
        >
          📎
        </motion.span>
      </div>
    </Stage>
  );
};

/* ── Gravity fall ─────────────────────────────────────────────────────── */
export const GravityPreview: React.FC = () => {
  const [fall, setFall] = useState(false);
  const WORDS = ['This', 'page', 'has', 'no', 'structural', 'integrity', 'whatsoever'];

  return (
    <Stage live={fall} hint="Every element gets a rigid body and a very bad day">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
        <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
          {WORDS.map((word, i) => (
            <motion.span
              key={word}
              animate={
                fall
                  ? { y: 150, rotate: (i % 2 ? 1 : -1) * (30 + i * 22), x: (i - 3) * 12, opacity: 0 }
                  : { y: 0, rotate: 0, x: 0, opacity: 1 }
              }
              transition={
                fall
                  ? { duration: 1.15, delay: i * 0.055, ease: [0.4, 0, 1, 1] }  // ease-in = acceleration
                  : { duration: 0.45, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }
              }
              className="px-2.5 py-1 rounded text-[13px] font-medium"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-200)' }}
            >
              {word}
            </motion.span>
          ))}
        </div>
        <TriggerButton onClick={() => setFall((v) => !v)} label={fall ? 'Reassemble' : 'Drop gravity'} />
      </div>
    </Stage>
  );
};

/* ── Party mode ───────────────────────────────────────────────────────── */
export const PartyPreview: React.FC = () => {
  const [on, setOn] = useState(false);
  const { melody } = useSynth();

  const start = () => {
    setOn((v) => {
      if (!v) melody([[392, 0.12], [523, 0.12], [659, 0.12], [784, 0.2]], 'square', 0.04);
      return !v;
    });
  };

  return (
    <Stage live={on} hint="Hue rotation + a beat you can feel in the layout">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <motion.div
          animate={on ? { filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'], scale: [1, 1.05, 1], rotate: [0, 1.5, -1.5, 0] } : {}}
          transition={on ? { duration: 1.1, repeat: Infinity, ease: 'linear' } : {}}
        >
          <SampleScene compact />
        </motion.div>
        <TriggerButton onClick={start} label={on ? 'Kill the lights' : 'Party mode'} />
      </div>
      {on && (
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-screen"
          animate={{ background: [
            'radial-gradient(circle at 20% 30%, rgba(217,106,85,0.22), transparent 55%)',
            'radial-gradient(circle at 80% 70%, rgba(127,176,212,0.22), transparent 55%)',
            'radial-gradient(circle at 50% 20%, rgba(171,151,207,0.22), transparent 55%)',
            'radial-gradient(circle at 20% 30%, rgba(217,106,85,0.22), transparent 55%)',
          ] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </Stage>
  );
};

/* ── CRT monitor ──────────────────────────────────────────────────────── */
export const CRTPreview: React.FC = () => (
  <Stage live hint="Scanlines, phosphor bloom, barrel distortion and a rolling refresh bar">
    <div className="absolute inset-0 flex items-center justify-center p-6">
      <div
        className="relative w-full max-w-[300px] h-[168px] rounded-[22px] overflow-hidden flex items-center justify-center"
        style={{
          background: '#0a1408',
          // The lens distortion. A real CRT bulges most at the centre.
          transform: 'perspective(600px) rotateX(1.5deg) scale(1.01)',
          boxShadow: 'inset 0 0 60px rgba(133,191,154,0.14), inset 0 0 12px rgba(0,0,0,0.9), 0 0 30px -8px rgba(133,191,154,0.3)',
        }}
      >
        <pre className="font-mono text-[11px] leading-[1.7] text-center" style={{ color: '#7fdc9a', textShadow: '0 0 6px #7fdc9a' }}>
{`READY.
LOAD "EGG",8,1

SEARCHING FOR EGG
LOADING`}
          <span className="animate-caret">▊</span>
        </pre>

        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.42) 0px, rgba(0,0,0,0.42) 1px, transparent 1px, transparent 3px)' }}
        />
        {/* Rolling refresh bar — the thing that makes a phone camera see bands */}
        <motion.div
          className="absolute left-0 right-0 h-14 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.045), transparent)' }}
          animate={{ top: ['-15%', '110%'] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
        />
        {/* Corner falloff */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 120% 120% at 50% 50%, transparent 55%, rgba(0,0,0,0.72) 100%)' }}
        />
      </div>
    </div>
  </Stage>
);

/* ── Pixelate ─────────────────────────────────────────────────────────── */
export const PixelatePreview: React.FC = () => {
  const [size, setSize] = useState(1);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    ctx.clearRect(0, 0, w, h);
    const px = size;
    // Render a gradient scene at low res, then upscale with smoothing off.
    // That's the entire technique — the browser does the blocking for you.
    for (let y = 0; y < h; y += px) {
      for (let x = 0; x < w; x += px) {
        const cx = x / w;
        const cy = y / h;
        const v = Math.sin(cx * 6 + t / 900) * Math.cos(cy * 5 - t / 1200);
        const hue = 34 + v * 26;
        const lum = 22 + (0.5 + v / 2) * 42;
        ctx.fillStyle = `hsl(${hue}, ${48 + v * 18}%, ${lum}%)`;
        ctx.fillRect(x, y, px, px);
      }
    }
  }, [size]);

  return (
    <div className="relative">
      <CanvasStage draw={draw} height={260} />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-3 py-1.5 rounded-lg"
           style={{ background: 'rgba(5,5,6,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <span className="text-[11px] font-mono" style={{ color: 'var(--text-500)' }}>{size}px</span>
        <input
          type="range" min={1} max={32} value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          aria-label="Pixel size"
          className="w-32 accent-[var(--cyan)]"
        />
      </div>
    </div>
  );
};

/* ── Steam locomotive ─────────────────────────────────────────────────── */
const SL_ART = [
  '      ====        ________                ___________ ',
  '  _D _|  |_______/        \\__I_I_____===__|_________| ',
  '   |(_)---  |   H\\________/ |   |        =|___ ___|   ',
  '   /     |  |   H  |  |     |   |         ||_| |_||   ',
  '  |      |  |   H  |__--------------------| [___] |   ',
  '  | ________|___H__/__|_____/[][]~\\_______|       |   ',
  '  |/ |   |-----------I_____I [][] []  D   |=======|__ ',
  '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ',
  ' |/-=|___|=    ||    ||    ||    |_____/~\\___/        ',
  '  \\_/      \\O=====O=====O=====O_/      \\_/            ',
];

export const SLPreview: React.FC = () => (
  <Stage live hint="Type `ls` too fast and this is your punishment">
    <div className="absolute inset-0 overflow-hidden flex items-center">
      <motion.pre
        className="font-mono whitespace-pre shrink-0"
        style={{ color: '#ffd23f', fontSize: 8.5, lineHeight: 1.28 }}
        animate={{ x: ['100%', '-160%'] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      >
        {SL_ART.join('\n')}
      </motion.pre>
    </div>
  </Stage>
);

/* ── Animated favicon ─────────────────────────────────────────────────── */
export const FaviconPreview: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const FRAMES = ['🥚', '🐣', '🐤', '🐥'];

  useEffect(() => {
    const id = window.setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 480);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Stage live hint="Redraw a canvas, write it to link[rel=icon] on an interval">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-full max-w-[300px] rounded-t-lg overflow-hidden"
          style={{ background: 'var(--void-200)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-end gap-1 px-2 pt-2" style={{ background: 'var(--void-300)' }}>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-t-md text-[11px]"
              style={{ background: 'var(--void-100)', color: 'var(--text-200)' }}
            >
              <span className="text-[13px] leading-none">{FRAMES[frame]}</span>
              Easter Eggs
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-t-md text-[11px] opacity-40" style={{ color: 'var(--text-400)' }}>
              <span>📄</span> Docs
            </div>
          </div>
          <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'var(--void-100)' }}>
            <span className="text-[11px]" style={{ color: 'var(--text-500)' }}>🔒</span>
            <span className="text-[11px] font-mono" style={{ color: 'var(--text-500)' }}>easter-eggs.dev</span>
          </div>
        </div>
      </div>
    </Stage>
  );
};

/* ── Shake to surprise ────────────────────────────────────────────────── */
export const ShakePreview: React.FC = () => {
  const [shaking, setShaking] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const shake = () => {
    setShaking(true);
    setTimeout(() => { setShaking(false); setRevealed(true); }, 700);
    setTimeout(() => setRevealed(false), 3400);
  };

  return (
    <Stage live={shaking || revealed} hint="On device this reads the accelerometer via devicemotion">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <motion.div
          animate={shaking ? { x: [0, -9, 9, -7, 7, -4, 4, 0], rotate: [0, -3, 3, -2, 2, 0] } : {}}
          transition={{ duration: 0.65 }}
          className="relative w-[126px] h-[212px] rounded-[20px] flex items-center justify-center"
          style={{ background: 'var(--void-200)', border: '2px solid rgba(255,255,255,0.11)', boxShadow: 'inset 0 0 24px rgba(0,0,0,0.7)' }}
        >
          <span className="absolute top-2 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.14)' }} />
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.span key="egg" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                           transition={{ type: 'spring', stiffness: 300, damping: 14 }} className="text-[42px]">
                🥚
              </motion.span>
            ) : (
              <motion.span key="idle" className="text-[11px] font-mono text-center px-4" style={{ color: 'var(--text-500)' }} exit={{ opacity: 0 }}>
                shake me
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        <TriggerButton onClick={shake} label="Shake" />
      </div>
    </Stage>
  );
};

/* ── Audio-only eggs ──────────────────────────────────────────────────── */
export const SoundPreview: React.FC<{ kind: '8bit' | 'wilhelm' | 'elevator' }> = ({ kind }) => {
  const { tone, scream, melody } = useSynth();
  const [playing, setPlaying] = useState(false);

  const play = () => {
    setPlaying(true);
    let dur = 900;
    if (kind === 'wilhelm') { scream(); dur = 1000; }
    if (kind === '8bit') {
      // Coin, then a 1-up.
      tone(988, 0.08, 'square', 0.05);
      tone(1319, 0.4, 'square', 0.05, 0.08);
      dur = 700;
    }
    if (kind === 'elevator') {
      // A ii–V–I in C, played badly on a triangle wave. As intended.
      dur = melody(
        [[587, 0.34], [698, 0.34], [880, 0.34], [784, 0.5], [659, 0.34], [523, 0.7]],
        'triangle',
        0.045,
      ) * 1000;
    }
    setTimeout(() => setPlaying(false), dur);
  };

  const copy = {
    '8bit': { icon: '🪙', label: 'Play coin + 1-up', hint: 'Synthesised live with WebAudio — no audio files' },
    wilhelm: { icon: '😱', label: 'Play the scream', hint: 'An homage. The real one is copyrighted Warner Bros. foley.' },
    elevator: { icon: '🛗', label: 'Play hold music', hint: 'ii–V–I in C. Plays while your build runs.' },
  }[kind];

  return (
    <Stage live={playing} hint={copy.hint}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <motion.span
          className="text-[44px]"
          animate={playing ? { scale: [1, 1.18, 1] } : {}}
          transition={{ duration: 0.42, repeat: playing ? Infinity : 0 }}
        >
          {copy.icon}
        </motion.span>

        {/* A level meter. Fake, but it gives the sound somewhere to land
            visually — audio with no visual feedback feels broken. */}
        <div className="flex items-end gap-1 h-8">
          {Array.from({ length: 13 }).map((_, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full"
              style={{ background: 'var(--cyan)' }}
              animate={playing ? { height: [4, 6 + Math.random() * 26, 4] } : { height: 4 }}
              transition={{ duration: 0.28, repeat: playing ? Infinity : 0, delay: i * 0.035 }}
            />
          ))}
        </div>

        <TriggerButton onClick={play} label={copy.label} />
      </div>
    </Stage>
  );
};

/* ── Dark mode toggle ─────────────────────────────────────────────────── */
export const DarkModePreview: React.FC = () => {
  const [dark, setDark] = useState(true);
  const [clicks, setClicks] = useState(0);

  return (
    <Stage live={clicks >= 5} hint={clicks >= 5 ? 'Five clicks. You found it.' : `Click the logo ${5 - clicks} more time${5 - clicks === 1 ? '' : 's'}`}>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-5 transition-colors duration-700"
        style={{ background: dark ? 'transparent' : '#f5f1e8' }}
      >
        <button
          onClick={() => {
            const n = clicks + 1;
            setClicks(n);
            if (n >= 5) { setDark((d) => !d); setClicks(0); }
          }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-[26px] transition-transform active:scale-90"
          style={{
            background: dark ? 'var(--void-200)' : '#e6dfd0',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)'}`,
          }}
          aria-label="Toggle secret theme"
        >
          {dark ? '🌙' : '☀️'}
        </button>
        <p className="text-[12px] font-medium transition-colors duration-700" style={{ color: dark ? 'var(--text-300)' : '#2c2410' }}>
          {dark ? 'Midnight' : 'Broad daylight'}
        </p>
      </div>
    </Stage>
  );
};

/* ── Rickroll ─────────────────────────────────────────────────────────── */
export const RickrollPreview: React.FC = () => {
  const [got, setGot] = useState(false);
  const { melody } = useSynth();

  return (
    <Stage live={got} hint="Wire it to a 404, a broken link, or a colleague's bookmark bar">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
        <AnimatePresence mode="wait">
          {got ? (
            <motion.div key="got" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.p
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 0.55, repeat: Infinity }}
                className="text-[46px] mb-3"
              >
                🕺
              </motion.p>
              <p className="font-display text-[15px] tracking-title" style={{ color: '#fff', textShadow: '0 0 6px #fff, 0 0 20px var(--magenta)' }}>NEVER GONNA GIVE YOU UP</p>
              <button onClick={() => setGot(false)} className="mt-4 text-[11px] font-mono underline" style={{ color: 'var(--text-500)' }}>
                let me down
              </button>
            </motion.div>
          ) : (
            <motion.div key="bait" exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
              <p className="text-[13px]" style={{ color: 'var(--text-300)' }}>
                Important quarterly figures — please review
              </p>
              <TriggerButton
                onClick={() => {
                  setGot(true);
                  melody([[392, 0.2], [440, 0.2], [523, 0.2], [440, 0.2], [659, 0.4], [659, 0.4], [587, 0.6]], 'square', 0.04);
                }}
                label="Open the spreadsheet"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Stage>
  );
};
