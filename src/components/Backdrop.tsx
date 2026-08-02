import React, { useEffect, useRef } from 'react';

/**
 * THE CABINET INTERIOR
 *
 * Two plates, back to front:
 *
 *   1. GRID     a perspective floor scrolling toward the viewer
 *   2. SPARKS   drifting pixel dust in cyan and magenta
 *
 * The sun lives in <Hero/>, not here — see the note below.
 *
 * The grid is the load-bearing element and it's worth being precise about.
 * Horizontal lines are spaced by a *power* function of their distance, not
 * linearly — spacing ∝ 1/(1-t) — which is what actually produces perspective
 * convergence. Evenly spaced lines that merely get closer together read as a
 * ladder lying down; correct spacing reads as a floor.
 *
 * The scroll offset is taken modulo one cell so the floor loops seamlessly
 * and appears infinite without ever allocating a new line.
 */

interface Spark {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  phase: number;
  speed: number;
  hue: 0 | 1;
}

export const Backdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let sparks: Spark[] = [];

    const build = () => {
      const n = Math.min(90, Math.max(24, Math.floor((w * h) / 26000)));
      sparks = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() < 0.8 ? 1 : 2,
        vy: -(4 + Math.random() * 13),
        vx: (Math.random() - 0.5) * 5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.3,
        hue: Math.random() < 0.55 ? 0 : 1,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    const drawGrid = (t: number) => {
      // The horizon sits low — 72% down — so the floor is a band along the
      // bottom rather than a plane the content has to sit on top of.
      const horizon = h * 0.72;
      const depth = h - horizon;
      if (depth <= 0) return;

      ctx.save();
      ctx.lineWidth = 1;

      // Verticals: converge on a single vanishing point at centre-horizon.
      const vpX = w / 2;
      const lanes = 26;
      for (let i = -lanes; i <= lanes; i++) {
        const spread = (i / lanes) * w * 2.1;
        const fade = 1 - Math.abs(i) / (lanes * 1.25);
        if (fade <= 0) continue;
        ctx.strokeStyle = `rgba(176, 108, 255, ${0.20 * fade})`;
        ctx.beginPath();
        ctx.moveTo(vpX, horizon);
        ctx.lineTo(vpX + spread, h);
        ctx.stroke();
      }

      // Horizontals: 1/(1-t) spacing, scrolled modulo one cell.
      const rows = 22;
      const scroll = ((t / 1000) * 0.42) % 1;
      for (let i = 0; i < rows; i++) {
        const k = (i + scroll) / rows;
        const y = horizon + depth * (k * k);   // quadratic ≈ perspective falloff
        if (y < horizon || y > h) continue;
        const near = (y - horizon) / depth;
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.06 + near * 0.30})`;
        ctx.lineWidth = 0.6 + near * 1.3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Haze at the horizon line itself — kills the hard seam where the
      // floor meets the void and sells the distance.
      const haze = ctx.createLinearGradient(0, horizon - 60, 0, horizon + 40);
      haze.addColorStop(0, 'rgba(6, 4, 15, 0)');
      haze.addColorStop(0.6, 'rgba(255, 45, 149, 0.09)');
      haze.addColorStop(1, 'rgba(6, 4, 15, 0)');
      ctx.fillStyle = haze;
      ctx.fillRect(0, horizon - 60, w, 100);

      ctx.restore();
    };

    const drawSparks = (t: number) => {
      for (const s of sparks) {
        ctx.beginPath();
        const twinkle = 0.45 + Math.sin(t / 420 * s.speed + s.phase) * 0.4;
        const a = Math.max(0, twinkle) * 0.8;
        ctx.fillStyle = s.hue === 0 ? `rgba(0, 229, 255, ${a})` : `rgba(255, 45, 149, ${a})`;
        // Square pixels, not circles. It's a raster display.
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.r, s.r);
        if (s.r > 1) {
          ctx.fillStyle = s.hue === 0 ? `rgba(0, 229, 255, ${a * 0.16})` : `rgba(255, 45, 149, ${a * 0.16})`;
          ctx.fillRect(Math.round(s.x) - 2, Math.round(s.y) - 2, s.r + 4, s.r + 4);
        }
      }
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      ctx.clearRect(0, 0, w, h);
      drawGrid(now);

      for (const s of sparks) {
        s.y += s.vy * dt;
        s.x += s.vx * dt;
        if (s.y < -6) { s.y = h + 6; s.x = Math.random() * w; }
        if (s.x < -6) s.x = w + 6;
        if (s.x > w + 6) s.x = -6;
      }
      drawSparks(now);

      raf = requestAnimationFrame(frame);
    };

    const startLoop = () => {
      if (reduced) return;
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else startLoop();
    };

    const paintStatic = () => {
      ctx.clearRect(0, 0, w, h);
      drawGrid(0);
      drawSparks(0);
    };

    resize();
    if (reduced) paintStatic();
    else startLoop();

    const onResize = () => {
      resize();
      if (reduced) paintStatic();
    };

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* The cabinet: violet-black with neon bounce pooling in the corners. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 15% 0%, rgba(0, 229, 255, 0.10) 0%, transparent 55%),' +
            'radial-gradient(ellipse 80% 55% at 88% 8%, rgba(255, 45, 149, 0.09) 0%, transparent 58%),' +
            'radial-gradient(ellipse 120% 70% at 50% 105%, rgba(176, 108, 255, 0.14) 0%, transparent 62%),' +
            'linear-gradient(180deg, #06040f 0%, #0a0618 55%, #100a24 100%)',
        }}
      />

      {/* No sun here. It used to live in this fixed layer at bottom:22%, which
          meant it never scrolled away — once the card grid covered it you only
          ever saw a hard-edged amber slice wedged between two rows, reading as
          a stray shape rather than a horizon. It now lives in <Hero/>, where it
          belongs compositionally and where it scrolls off with the marquee. */}

      <canvas ref={canvasRef} className="absolute inset-0" style={{ background: 'transparent' }} />

      {/* Dot grid over the upper half — cabinet art, and it gives the empty
          space above the fold something to be. */}
      <div className="absolute inset-x-0 top-0 h-[62vh] dot-grid" style={{ opacity: 0.5, maskImage: 'linear-gradient(180deg, #000, transparent)', WebkitMaskImage: 'linear-gradient(180deg, #000, transparent)' }} />
    </div>
  );
};
