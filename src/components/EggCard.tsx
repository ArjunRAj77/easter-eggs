import React, { useRef, useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Check } from 'lucide-react';
import type { EasterEgg } from '../data/eggs';
import { resolveIcon, categoryLight, difficultyLight } from '../lib/registry';

interface EggCardProps {
  egg: EasterEgg;
  index: number;
  onClick: (egg: EasterEgg) => void;
  hasPreview: boolean;
  collected: boolean;
  cracking: boolean;
}

/**
 * A CABINET TILE.
 *
 * Three pieces of game feel, in order of how much they matter:
 *
 * 1. **Tilt toward the pointer.** The card rotates on X and Y as the cursor
 *    crosses it, capped at 7°. Past about 10° the perspective distortion
 *    becomes obvious and it reads as a gimmick; under 5° nobody notices.
 *    Seven is the sweet spot where it feels like an object without ever
 *    announcing itself.
 *
 * 2. **Squash on press.** `scale(0.96)` with a matching `translateZ` dip.
 *    A button that doesn't move when pressed feels broken, and this is the
 *    cheapest possible fix.
 *
 * 3. **A moving glare.** A hard-edged diagonal sheen tracks the pointer,
 *    the way light crosses a glossy arcade bezel. This is the tell that the
 *    surface is a physical panel and not a div.
 *
 * All three are written straight to the node through CSS custom properties
 * in a `mousemove` handler — no React state, so no re-render per frame. That
 * matters at 60 cards.
 */
export const EggCard: React.FC<EggCardProps> = ({ egg, index, onClick, hasPreview, collected, cracking }) => {
  const Icon = resolveIcon(egg.iconName);
  const tube = categoryLight[egg.category];
  const diff = difficultyLight[egg.difficulty];
  const ref = useRef<HTMLDivElement>(null);
  const [pressed, setPressed] = useState(false);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${(0.5 - py) * 7}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * 7}deg`);
    el.style.setProperty('--mx', `${px * 100}%`);
    el.style.setProperty('--my', `${py * 100}%`);
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }, []);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 26, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.16 } }}
      transition={{
        type: 'spring',
        stiffness: 320,
        damping: 26,
        // 26ms stagger, capped at 12 — the cards deal into the grid like a
        // hand of cards rather than all landing at once.
        delay: Math.min(index, 12) * 0.026,
      }}
      className="h-full"
      style={{ perspective: 900 }}
    >
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-label={`${egg.title} — ${egg.category}, ${egg.difficulty}${collected ? ', collected' : ''}`}
        onClick={() => onClick(egg)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(egg);
          }
        }}
        onMouseMove={onMove}
        onMouseLeave={() => { onLeave(); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        className={`group relative h-full cursor-pointer rounded-2xl overflow-hidden ${cracking ? 'animate-crack' : ''}`}
        style={
          {
            background: 'linear-gradient(165deg, var(--void-200) 0%, var(--void-100) 55%, var(--void-050) 100%)',
            border: `1px solid ${collected ? tube.edge : 'rgba(176,108,255,0.16)'}`,
            boxShadow: collected
              ? `0 0 20px -8px ${tube.tint}, inset 0 0 28px -20px ${tube.tint}`
              : '0 8px 26px -14px rgba(0,0,0,0.9)',
            transform: `rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(${pressed ? 0.96 : 1})`,
            transformStyle: 'preserve-3d',
            transition: 'transform .18s var(--ease-snap), border-color .35s, box-shadow .35s',
            '--rx': '0deg',
            '--ry': '0deg',
            '--mx': '50%',
            '--my': '50%',
            '--tube': tube.tint,
          } as React.CSSProperties
        }
      >
        {/* Tube glow — the border lights up on approach. */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-400"
          style={{ boxShadow: `0 0 0 1px ${tube.tint}, 0 0 34px -6px ${tube.tint}, inset 0 0 44px -26px ${tube.tint}` }}
          aria-hidden="true"
        />

        {/* Bezel glare */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(420px circle at var(--mx) var(--my), ${tube.tint}1f, transparent 55%)`,
          }}
          aria-hidden="true"
        />

        {/* Corner bracket — arcade UI furniture, and it points the eye at
            the icon without needing a box. */}
        <span
          className="absolute top-0 left-0 w-6 h-6 pointer-events-none opacity-60"
          style={{ borderTop: `2px solid ${tube.tint}`, borderLeft: `2px solid ${tube.tint}`, borderTopLeftRadius: 16 }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col h-full p-5" style={{ transform: 'translateZ(24px)' }}>
          <header className="flex items-start justify-between gap-3 mb-4">
            <span
              className="relative flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-all duration-400"
              style={{
                background: tube.wash,
                border: `1px solid ${tube.edge}`,
                color: tube.tint,
                boxShadow: `0 0 16px -6px ${tube.tint}, inset 0 0 18px -12px ${tube.tint}`,
              }}
            >
              <Icon size={19} strokeWidth={2} />
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {collected && (
                <motion.span
                  initial={{ scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                  className="flex items-center justify-center w-5 h-5 rounded-full"
                  style={{ background: 'var(--lime)', color: 'var(--void-000)', boxShadow: '0 0 14px -2px var(--lime)' }}
                  title="Collected"
                >
                  <Check size={11} strokeWidth={3.5} />
                </motion.span>
              )}
              <span
                className={
                  'px-2 py-1 rounded font-pixel text-[8.5px] uppercase leading-none ' +
                  (egg.difficulty === 'Chaotic' ? 'group-hover:animate-shake' : '')
                }
                style={{
                  color: diff.tint,
                  background: `${diff.tint}16`,
                  border: `1px solid ${diff.tint}44`,
                  textShadow: `0 0 8px ${diff.tint}`,
                }}
              >
                {diff.label}
              </span>
            </div>
          </header>

          <h3
            className="font-display text-[16.5px] leading-snug mb-2 transition-all duration-300"
            style={{ color: 'var(--text-100)' }}
          >
            {egg.title}
          </h3>

          <p className="text-[13px] leading-[1.65] flex-grow" style={{ color: 'var(--text-400)' }}>
            {egg.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {egg.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[11px] font-mono"
                style={{ background: 'rgba(176,108,255,0.10)', color: 'var(--text-400)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          <footer
            className="flex items-center justify-between mt-4 pt-3.5 border-t"
            style={{ borderColor: 'rgba(176,108,255,0.14)' }}
          >
            <span className="flex items-center gap-2 font-pixel text-[10px] uppercase" style={{ color: 'var(--text-500)' }}>
              <span style={{ color: tube.tint, textShadow: `0 0 8px ${tube.tint}` }}>◆</span>
              {egg.category}
              {hasPreview && <span style={{ color: 'var(--lime)' }}>· PLAY</span>}
            </span>
            <span
              className="flex items-center gap-1 text-[11px] font-semibold opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
              style={{ color: tube.tint }}
            >
              Insert coin <ArrowUpRight size={13} />
            </span>
          </footer>
        </div>
      </div>
    </motion.article>
  );
};
