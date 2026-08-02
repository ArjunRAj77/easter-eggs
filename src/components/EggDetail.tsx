import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { EasterEgg } from '../data/eggs';
import { CodeBlock } from './CodeBlock';
import { renderPreview, hasPreview } from './previews';
import { resolveIcon, categoryLight, difficultyLight } from '../lib/registry';

interface EggDetailProps {
  egg: EasterEgg | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  collectedCount: number;
  total: number;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The detail sheet.
 *
 * Shot as a close-up: the page behind is pushed to a heavy blur and dropped
 * two stops, so the sheet is unambiguously the subject. That backdrop blur is
 * doing the same job a wide-open aperture does — it isn't decoration, it's
 * what tells the eye where to look.
 *
 * Accessibility this component gained in the rebuild: role="dialog" with
 * aria-modal, an initial focus target, a real focus trap on Tab, focus
 * restoration to the invoking card on close, Escape to dismiss, and ← / →
 * to walk the filtered gallery without reaching for the mouse.
 */
export const EggDetail: React.FC<EggDetailProps> = ({ egg, onClose, onPrev, onNext, collectedCount, total }) => {
  const [tab, setTab] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<Element | null>(null);

  // Reset the snippet tab whenever a different egg opens, or you land on
  // "Python" for an egg that has no Python.
  useEffect(() => { setTab(0); }, [egg?.id]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!egg) return;
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowLeft' && onPrev) { onPrev(); return; }
      if (e.key === 'ArrowRight' && onNext) { onNext(); return; }

      if (e.key === 'Tab' && panelRef.current) {
        const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
          .filter((n) => n.offsetParent !== null);
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    },
    [egg, onClose, onPrev, onNext],
  );

  useEffect(() => {
    if (!egg) return;
    restoreRef.current = document.activeElement;
    document.addEventListener('keydown', handleKey);

    // Lock the page behind the modal, compensating for the scrollbar so the
    // layout doesn't jump sideways when it disappears.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
      window.clearTimeout(focusTimer);
      (restoreRef.current as HTMLElement | null)?.focus?.();
    };
  }, [egg, handleKey]);

  return (
    <AnimatePresence>
      {egg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ background: 'rgba(6,4,15,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="egg-title"
            initial={{ opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[1080px] max-h-[92vh] sm:max-h-[88vh] overflow-hidden rounded-t-2xl sm:rounded-2xl flex flex-col"
            style={{
              background: 'linear-gradient(178deg, var(--void-200), var(--void-050) 62%)',
              border: '1px solid rgba(0,229,255,0.28)',
              boxShadow: '0 40px 120px -30px rgba(0,0,0,0.96), 0 0 60px -24px var(--cyan)',
            }}
          >
            <DetailHeader egg={egg} onClose={onClose} onPrev={onPrev} onNext={onNext} closeRef={closeRef} />

            <div className="flex-1 overflow-y-auto">
              <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-7 p-6 sm:p-8">
                {/* Preview column */}
                <section aria-label="Live preview">
                  <SectionLabel>
                    {hasPreview(egg.id) ? '▶ Playable' : 'Preview'}
                  </SectionLabel>
                  {renderPreview(egg.id)}

                  <div className="mt-6">
                    <SectionLabel>Tags</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {egg.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-md text-[11px] font-mono"
                          style={{ background: 'rgba(176,108,255,0.12)', color: 'var(--text-400)', border: '1px solid rgba(176,108,255,0.22)' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Code column */}
                <section aria-label="Code snippets" className="min-w-0">
                  <SectionLabel>
                    Implementation
                    <span className="ml-2 normal-case tracking-normal" style={{ color: 'var(--text-500)' }}>
                      {egg.snippets.length} snippet{egg.snippets.length === 1 ? '' : 's'}
                    </span>
                  </SectionLabel>

                  {egg.snippets.length > 1 && (
                    <div
                      role="tablist"
                      aria-label="Language"
                      className="flex gap-1.5 mb-3.5 overflow-x-auto no-scrollbar"
                    >
                      {egg.snippets.map((s, i) => (
                        <button
                          key={s.label + i}
                          role="tab"
                          aria-selected={tab === i}
                          onClick={() => setTab(i)}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition-all duration-300"
                          style={{
                            color: tab === i ? '#fff' : 'var(--text-400)',
                            background: tab === i ? 'rgba(0,229,255,0.14)' : 'rgba(176,108,255,0.07)',
                            border: `1px solid ${tab === i ? 'var(--cyan)' : 'rgba(176,108,255,0.18)'}`,
                            boxShadow: tab === i ? '0 0 16px -6px var(--cyan)' : 'none',
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {egg.snippets[tab] && (
                    <CodeBlock
                      key={`${egg.id}-${tab}`}
                      code={egg.snippets[tab].code}
                      language={egg.snippets[tab].language}
                      label={egg.snippets[tab].label}
                    />
                  )}
                </section>
              </div>
            </div>

            {/* Footer hint strip */}
            <div
              className="shrink-0 px-6 sm:px-8 py-3 border-t flex items-center justify-between"
              style={{ borderColor: 'rgba(176,108,255,0.20)', background: 'rgba(0,0,0,0.24)' }}
            >
              <span className="font-pixel text-[10px] hidden sm:block" style={{ color: 'var(--text-500)' }}>
                ← → BROWSE · ESC CLOSE
              </span>
              <span className="flex items-center gap-3">
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-500)' }}>
                  {egg.id}
                </span>
                <span
                  className="font-pixel text-[10px] px-2 py-1 rounded"
                  style={{
                    color: 'var(--lime)',
                    background: 'rgba(124,255,79,0.10)',
                    border: '1px solid rgba(124,255,79,0.30)',
                  }}
                >
                  FOUND {collectedCount}/{total}
                </span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="font-pixel text-[10px] tracking-eyebrow uppercase mb-3" style={{ color: 'var(--text-500)' }}>
    {children}
  </h3>
);

const DetailHeader: React.FC<{
  egg: EasterEgg;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}> = ({ egg, onClose, onPrev, onNext, closeRef }) => {
  const Icon = resolveIcon(egg.iconName);
  const light = categoryLight[egg.category];
  const diff = difficultyLight[egg.difficulty];

  return (
    <header
      className="relative shrink-0 px-6 sm:px-8 pt-7 pb-6 border-b overflow-hidden"
      style={{ borderColor: 'rgba(176,108,255,0.20)' }}
    >
      {/* The category practical, spilling in from the left. */}
      <div
        className="absolute -top-24 -left-16 w-72 h-72 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${light.tint}1c, transparent 66%)`, filter: 'blur(38px)' }}
        aria-hidden="true"
      />

      <div className="relative flex items-start gap-4">
        <span
          className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
          style={{
            background: light.wash,
            border: `1px solid ${light.edge}`,
            color: light.tint,
            boxShadow: `0 0 22px -6px ${light.tint}, inset 0 0 22px -14px ${light.tint}`,
          }}
        >
          <Icon size={21} strokeWidth={2} />
        </span>

        <div className="flex-1 min-w-0 pr-2">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-pixel text-[10px] tracking-eyebrow uppercase" style={{ color: light.tint, textShadow: `0 0 10px ${light.tint}` }}>
              {egg.category}
            </span>
            <span style={{ color: 'var(--text-500)' }}>·</span>
            <span className="font-pixel text-[10px] tracking-eyebrow uppercase" style={{ color: diff.tint, textShadow: `0 0 10px ${diff.tint}` }}>
              {diff.label}
            </span>
          </div>
          <h2 id="egg-title" className="font-display text-[21px] sm:text-[26px] leading-tight mb-2" style={{ color: '#fff', textShadow: `0 0 20px ${light.tint}` }}>
            {egg.title}
          </h2>
          <p className="text-[13.5px] leading-relaxed max-w-[46rem]" style={{ color: 'var(--text-300)' }}>
            {egg.description}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <IconBtn onClick={onPrev} label="Previous egg"><ChevronLeft size={16} /></IconBtn>
          <IconBtn onClick={onNext} label="Next egg"><ChevronRight size={16} /></IconBtn>
          <span className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg transition-all duration-300 hover:bg-white/[0.06]"
            style={{ color: 'var(--text-300)' }}
          >
            <X size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};

const IconBtn: React.FC<{ onClick?: () => void; label: string; children: React.ReactNode }> = ({ onClick, label, children }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    aria-label={label}
    className="p-2 rounded-lg transition-all duration-300 hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed"
    style={{ color: 'var(--text-400)' }}
  >
    {children}
  </button>
);
