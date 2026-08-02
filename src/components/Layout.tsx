import React from 'react';
import { Github, Twitter, Shuffle, Plus, RotateCcw } from 'lucide-react';
import { Backdrop } from './Backdrop';
import { REPO_URL } from '../lib/registry';

interface LayoutProps {
  children: React.ReactNode;
  onOpenSubmission?: () => void;
  totalEggs: number;
  collected: number;
  onResetCollection: () => void;
}

/**
 * THE CABINET.
 *
 * Backdrop plate at the bottom, content in the middle, and the CRT layers —
 * glass, scanlines, roll bar — composited over everything at z-98..100 via
 * the `.crt` / `.scanlines` pseudo-elements.
 *
 * Note there is no z-index on <main>. Adding one creates a stacking context
 * that traps modals below the sticky header.
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  onOpenSubmission,
  totalEggs,
  collected,
  onResetCollection,
}) => {
  const pct = totalEggs === 0 ? 0 : (collected / totalEggs) * 100;
  const done = collected === totalEggs && totalEggs > 0;

  return (
    <div className="min-h-screen relative crt scanlines" style={{ background: 'var(--void-000)' }}>
      <Backdrop />

      <a
        href="#gallery"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[110] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--cyan)] focus:text-[var(--void-000)] focus:font-bold focus:text-sm"
      >
        Skip to gallery
      </a>

      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(6,4,15,0.80)',
          backdropFilter: 'blur(18px) saturate(150%)',
          WebkitBackdropFilter: 'blur(18px) saturate(150%)',
          borderBottom: '1px solid rgba(176,108,255,0.20)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 group shrink-0" aria-label="Easter Eggs — home">
            <span
              className="relative flex items-center justify-center w-9 h-10 rounded-[45%_45%_50%_50%/60%_60%_40%_40%] transition-transform duration-300 group-hover:scale-110"
              style={{
                background: 'linear-gradient(160deg, #fdfbff, #d6ccf5 55%, #a897dd)',
                boxShadow: '0 0 18px -4px var(--violet)',
              }}
            >
              <span className="absolute w-1.5 h-1.5 rounded-full" style={{ background: '#241d40', top: 15, left: 10 }} />
              <span className="absolute w-1.5 h-1.5 rounded-full" style={{ background: '#241d40', top: 15, right: 10 }} />
            </span>
            <span className="flex flex-col leading-none">
              <span
                className="font-display text-[16px] tracking-title"
                style={{ color: '#fff', textShadow: '0 0 4px #fff, 0 0 16px var(--cyan)' }}
              >
                EASTER EGGS
              </span>
              <span className="font-pixel text-[10px] tracking-eyebrow mt-1.5" style={{ color: 'var(--text-500)' }}>
                ARCADE EDITION
              </span>
            </span>
          </a>

          {/* Score plate. A collection with no visible counter isn't a
              collection, it's just history. */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-end">
              <span className="font-pixel text-[10px] tracking-eyebrow mb-1" style={{ color: 'var(--text-500)' }}>
                FOUND
              </span>
              <span
                className="font-display text-[13px] leading-none"
                style={{ color: done ? 'var(--lime)' : 'var(--text-100)', textShadow: done ? '0 0 12px var(--lime)' : 'none' }}
              >
                {String(collected).padStart(2, '0')}
                <span style={{ color: 'var(--text-500)' }}>/{totalEggs}</span>
              </span>
            </div>
            <div
              className="relative w-28 h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={collected}
              aria-valuemin={0}
              aria-valuemax={totalEggs}
              aria-label="Eggs collected"
              style={{ background: 'rgba(176,108,255,0.16)' }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: done
                    ? 'linear-gradient(90deg, var(--lime), var(--cyan))'
                    : 'linear-gradient(90deg, var(--cyan), var(--magenta))',
                  boxShadow: `0 0 12px ${done ? 'var(--lime)' : 'var(--magenta)'}`,
                }}
              />
            </div>
            {collected > 0 && (
              <button
                onClick={onResetCollection}
                aria-label="Reset collection"
                title="Reset collection"
                className="p-1.5 rounded-md transition-colors hover:bg-white/[0.06]"
                style={{ color: 'var(--text-500)' }}
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          <nav className="flex items-center gap-1.5">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('eggs:random'))}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-all duration-300 hover:bg-white/[0.06]"
              style={{ color: 'var(--text-300)' }}
            >
              <Shuffle size={14} />
              Random
            </button>

            <button
              onClick={onOpenSubmission}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12.5px] font-bold transition-all duration-300 tube"
              style={{ ['--tube' as string]: 'var(--cyan)', color: 'var(--cyan)', background: 'rgba(0,229,255,0.08)' } as React.CSSProperties}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Submit</span>
            </button>

            <span className="w-px h-5 mx-1" style={{ background: 'rgba(176,108,255,0.24)' }} />

            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub repository"
              className="p-2 rounded-lg transition-all duration-300 hover:bg-white/[0.06]"
              style={{ color: 'var(--text-400)' }}
            >
              <Github size={17} />
            </a>
            <a
              href="https://twitter.com/intent/tweet?text=A%20gallery%20of%20developer%20easter%20eggs"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Share on X"
              className="hidden sm:block p-2 rounded-lg transition-all duration-300 hover:bg-white/[0.06]"
              style={{ color: 'var(--text-400)' }}
            >
              <Twitter size={17} />
            </a>
          </nav>
        </div>

        {/* Tube under the bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--cyan) 22%, var(--magenta) 50%, var(--cyan) 78%, transparent)',
            boxShadow: '0 0 12px var(--magenta)',
            opacity: 0.75,
          }}
        />
      </header>

      <main className="relative">{children}</main>

      <footer className="relative mt-24" style={{ borderTop: '1px solid rgba(176,108,255,0.16)' }}>
        {/* Scrolling attract-mode ticker. */}
        <div className="relative overflow-hidden py-2.5" style={{ background: 'rgba(6,4,15,0.6)' }}>
          <div className="flex whitespace-nowrap font-pixel text-[10px]" style={{ animation: 'marquee-x 26s linear infinite' }}>
            {[0, 1].map((k) => (
              <span key={k} className="flex shrink-0">
                {['↑↑↓↓←→←→BA', 'TYPE 42', 'TYPE CRT', 'TYPE GRAIN', 'FIND ALL 60', 'PRESS / TO SEARCH'].map((t, i) => (
                  <span
                    key={t}
                    className="px-6"
                    style={{ color: ['var(--cyan)', 'var(--magenta)', 'var(--amber)', 'var(--lime)', 'var(--violet)', 'var(--cyan)'][i] }}
                  >
                    ★ {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p
                className="font-display text-[14px] tracking-title mb-2"
                style={{ color: '#fff', textShadow: '0 0 14px var(--violet)' }}
              >
                EASTER EGGS
              </p>
              <p className="text-[12.5px]" style={{ color: 'var(--text-500)' }}>
                © {new Date().getFullYear()} · {totalEggs} secrets, hand-curated · MIT
              </p>
            </div>

            <div className="flex items-center gap-6 text-[12.5px]">
              <a
                href={`${REPO_URL}/blob/main/README.md`}
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-[var(--cyan)]"
                style={{ color: 'var(--text-500)' }}
              >
                Docs
              </a>
              <a
                href={`${REPO_URL}/blob/main/LICENSE`}
                target="_blank"
                rel="noreferrer noopener"
                className="transition-colors hover:text-[var(--cyan)]"
                style={{ color: 'var(--text-500)' }}
              >
                License
              </a>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('eggs:random'))}
                className="transition-colors hover:text-[var(--magenta)]"
                style={{ color: 'var(--text-500)' }}
              >
                Random
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
