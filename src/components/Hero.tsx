import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  total: number;
  categories: number;
  languages: number;
  collected: number;
}

/**
 * THE MARQUEE.
 *
 * An arcade cabinet's marquee is a backlit sign, so the title is treated as
 * a neon sign rather than as typography: a white-hot core inside a cyan and
 * magenta bloom, with 2px of RGB misregistration.
 *
 * The tubes strike in sequence — EASTER, then EGGS — because a real sign
 * with two words has two ballasts and they never fire together. That
 * half-second of stagger is most of the character.
 */
export const Hero: React.FC<HeroProps> = ({ total, categories, languages, collected }) => {
  const stats = [
    { value: total, label: 'SECRETS', tube: 'var(--cyan)' },
    { value: categories, label: 'WORLDS', tube: 'var(--magenta)' },
    { value: languages, label: 'LANGS', tube: 'var(--amber)' },
    { value: collected, label: 'FOUND', tube: 'var(--lime)' },
  ];

  return (
    <section id="top" className="relative overflow-hidden">
      {/*
        THE SUN.

        It lives here rather than in <Backdrop/> for two reasons. It scrolls
        away with the marquee instead of sitting fixed behind the card grid —
        where it only ever showed as a hard amber slice between two rows — and
        it's clipped by this section's bottom edge, so it *sets* behind the
        horizon rather than floating as a complete disc. A synthwave sun that
        isn't cut off at the bottom always reads as a circle, never as a sun.

        Opacity is 0.30. Above roughly 0.4 it starts competing with the neon
        title for the eye, and the title has to win.
      */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ bottom: -190, width: 440, height: 440 }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 rounded-full animate-pulse-glow"
          style={{
            background: 'linear-gradient(180deg, #ffd23f 0%, #ff7a3d 34%, #ff2d95 68%, #b06cff 100%)',
            opacity: 0.3,
            maskImage:
              'linear-gradient(180deg, #000 0 50%, transparent 50% 54%, #000 54% 64%, transparent 64% 69%, #000 69% 77%, transparent 77% 83%, #000 83% 89%, transparent 89% 96%, #000 96%)',
            WebkitMaskImage:
              'linear-gradient(180deg, #000 0 50%, transparent 50% 54%, #000 54% 64%, transparent 64% 69%, #000 69% 77%, transparent 77% 83%, #000 83% 89%, transparent 89% 96%, #000 96%)',
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,122,61,0.22), transparent 68%)', filter: 'blur(52px)' }}
        />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-5 sm:px-8 pt-20 pb-16 sm:pt-28 sm:pb-20 text-center">
        {/* Attract-mode prompt. Every cabinet has one. */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-pixel text-[10px] sm:text-[10px] tracking-eyebrow mb-8 animate-attract"
          style={{ color: 'var(--amber)', textShadow: '0 0 12px var(--amber)' }}
        >
          ★ INSERT COIN — 60 SECRETS TO FIND ★
        </motion.p>

        <h1 className="font-display leading-[0.95] text-[2.6rem] sm:text-[4.4rem] lg:text-[5.6rem] mb-2">
          <motion.span
            className="block animate-strike rgb-split"
            style={{ color: '#fff', textShadow: '0 0 6px #fff, 0 0 24px var(--cyan), 0 0 60px var(--cyan)' }}
          >
            EASTER
          </motion.span>
          <motion.span
            className="block animate-strike rgb-split"
            style={{
              color: '#fff',
              textShadow: '0 0 6px #fff, 0 0 24px var(--magenta), 0 0 60px var(--magenta)',
              animationDelay: '0.45s',
            }}
          >
            EGGS
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 mx-auto max-w-[42rem] text-[14.5px] sm:text-[16px] leading-[1.75]"
          style={{ color: 'var(--text-300)' }}
        >
          Konami codes. Barrel rolls. A cat that follows your cursor. ASCII fire.
          Sixty secrets, every one of them <span style={{ color: 'var(--lime)' }}>playable right here</span> before
          you steal the code.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="px-4 py-2.5 rounded-xl min-w-[84px] tube"
              style={{ ['--tube' as string]: s.tube, background: 'rgba(6,4,15,0.55)' } as React.CSSProperties}
            >
              <div
                className="font-display text-[1.5rem] sm:text-[1.85rem] leading-none"
                style={{ color: '#fff', textShadow: `0 0 4px #fff, 0 0 18px ${s.tube}` }}
              >
                {String(s.value).padStart(2, '0')}
              </div>
              <div className="mt-1.5 font-pixel text-[10px] tracking-eyebrow" style={{ color: s.tube }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.a
          href="#gallery"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-14 inline-flex flex-col items-center gap-1.5 group"
          aria-label="Scroll to the gallery"
        >
          <span className="font-pixel text-[10px] tracking-eyebrow" style={{ color: 'var(--text-500)' }}>
            PRESS START
          </span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            style={{ color: 'var(--cyan)', filter: 'drop-shadow(0 0 8px var(--cyan))' }}
          >
            <ChevronDown size={20} />
          </motion.span>
        </motion.a>
      </div>
    </section>
  );
};
