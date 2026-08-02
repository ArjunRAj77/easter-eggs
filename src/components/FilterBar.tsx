import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { Category, Difficulty } from '../data/eggs';
import { CATEGORIES, DIFFICULTIES, categoryLight, difficultyLight } from '../lib/registry';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (category: Category | 'All') => void;
  selectedDifficulty: Difficulty | 'All';
  setSelectedDifficulty: (difficulty: Difficulty | 'All') => void;
  resultCount: number;
  totalCount: number;
}

/**
 * THE CONTROL PANEL.
 *
 * Sticks at 68px — directly under the header, not at 0. Two bars both pinned
 * to top-0 occupy the same band, which is why the filters used to slide under
 * the nav on scroll.
 *
 * The difficulty filter renders here for the first time. The state, the props
 * and the filter predicate all existed already; nothing ever drew the buttons,
 * so a third of the filtering logic was unreachable.
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  resultCount,
  totalCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setSearchQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchQuery]);

  const isFiltered = selectedCategory !== 'All' || selectedDifficulty !== 'All' || searchQuery !== '';

  const clearAll = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
  };

  return (
    <div
      className="sticky top-[68px] z-40"
      style={{
        background: 'rgba(6,4,15,0.86)',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        borderBottom: '1px solid rgba(176,108,255,0.18)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row gap-3.5 lg:items-center">
          {/* Search */}
          <div className="relative lg:w-[300px] shrink-0 group">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-300 group-focus-within:text-[var(--cyan)]"
              style={{ color: 'var(--text-500)' }}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search secrets…"
              aria-label="Search easter eggs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl pl-10 pr-16 py-2.5 text-[13px] transition-all duration-300 outline-none"
              style={{
                background: 'var(--void-150)',
                border: '1px solid rgba(176,108,255,0.22)',
                color: 'var(--text-100)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--cyan)';
                e.currentTarget.style.boxShadow = '0 0 20px -4px var(--cyan), inset 0 0 20px -14px var(--cyan)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(176,108,255,0.22)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors duration-200"
                style={{ color: 'var(--text-400)' }}
              >
                <X size={13} />
              </button>
            ) : (
              <kbd
                className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center px-1.5 py-0.5 rounded font-pixel text-[10px] pointer-events-none"
                style={{
                  background: 'rgba(176,108,255,0.14)',
                  color: 'var(--text-400)',
                  border: '1px solid rgba(176,108,255,0.24)',
                }}
              >
                /
              </kbd>
            )}
          </div>

          {/* World select */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 lg:flex-1">
            <span className="hidden lg:block font-pixel text-[10px] tracking-eyebrow shrink-0 pr-1" style={{ color: 'var(--text-500)' }}>
              WORLD
            </span>
            <Pill active={selectedCategory === 'All'} onClick={() => setSelectedCategory('All')} label="All" tint="#b06cff" />
            {CATEGORIES.map((cat) => (
              <Pill
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
                label={cat}
                tint={categoryLight[cat].tint}
              />
            ))}
          </div>

          {/* Threat level */}
          <div
            className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 lg:pl-5 shrink-0"
            style={{ borderLeft: '1px solid rgba(176,108,255,0.18)' }}
          >
            <span className="hidden lg:block font-pixel text-[10px] tracking-eyebrow shrink-0 pr-1" style={{ color: 'var(--text-500)' }}>
              RISK
            </span>
            <Pill active={selectedDifficulty === 'All'} onClick={() => setSelectedDifficulty('All')} label="Any" tint="#b06cff" />
            {DIFFICULTIES.map((d) => (
              <Pill
                key={d}
                active={selectedDifficulty === d}
                onClick={() => setSelectedDifficulty(d)}
                label={d}
                tint={difficultyLight[d].tint}
              />
            ))}
          </div>
        </div>

        {/* Read-out. Announced politely so screen-reader users hear the count
            change without the filter buttons stealing focus. */}
        <div className="mt-2.5 flex items-center gap-3 min-h-[16px]">
          <p className="font-pixel text-[10px]" style={{ color: 'var(--text-500)' }} aria-live="polite">
            {resultCount === totalCount ? `${totalCount} SECRETS` : `${resultCount} / ${totalCount} SECRETS`}
          </p>
          {isFiltered && (
            <button
              onClick={clearAll}
              className="font-pixel text-[10px] transition-colors duration-200"
              style={{ color: 'var(--magenta)' }}
            >
              [CLEAR]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * A cabinet button. Unlit when off, a struck tube when on — and it physically
 * depresses, because a control-panel button that doesn't move when pressed is
 * the fastest way to make an interface feel dead.
 */
const Pill: React.FC<{
  active: boolean;
  onClick: () => void;
  label: string;
  tint: string;
}> = ({ active, onClick, label, tint }) => (
  <motion.button
    onClick={onClick}
    aria-pressed={active}
    whileTap={{ scale: 0.92, y: 1 }}
    transition={{ type: 'spring', stiffness: 600, damping: 20 }}
    className="relative shrink-0 px-3.5 py-1.5 rounded-lg font-display text-[11.5px] uppercase tracking-wide whitespace-nowrap transition-all duration-300"
    style={{
      color: active ? '#fff' : 'var(--text-400)',
      background: active ? `${tint}1f` : 'rgba(176,108,255,0.07)',
      border: `1px solid ${active ? tint : 'rgba(176,108,255,0.18)'}`,
      boxShadow: active ? `0 0 18px -4px ${tint}, inset 0 0 18px -12px ${tint}` : 'none',
      textShadow: active ? `0 0 10px ${tint}` : 'none',
    }}
  >
    {label}
  </motion.button>
);
