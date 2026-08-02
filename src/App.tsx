/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { FilterBar } from './components/FilterBar';
import { EggCard } from './components/EggCard';
import { EggDetail } from './components/EggDetail';
import { SubmissionForm } from './components/SubmissionForm';
import { MetaEggs } from './components/MetaEggs';
import { Mascot } from './components/Mascot';
import { hasPreview } from './components/previews';
import { useCollection } from './lib/collection';
import { eggs, type Category, type Difficulty } from './data/eggs';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [scareToken, setScareToken] = useState(0);

  const collection = useCollection(eggs.length);

  /* Filtering. Tags are searchable now — they were indexed in the data and
     rendered on the cards, but the old predicate only looked at title and
     description, so searching "konami" found nothing tagged with it. */
  const filteredEggs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return eggs.filter((egg) => {
      const matchesSearch =
        q === '' ||
        egg.title.toLowerCase().includes(q) ||
        egg.description.toLowerCase().includes(q) ||
        egg.tags.some((t) => t.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'All' || egg.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || egg.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  /* Selection is stored as an id rather than an object so prev/next can walk
     the *current* filtered list, and so a selected egg survives a data reload. */
  const selectedEgg = useMemo(
    () => (selectedId ? eggs.find((e) => e.id === selectedId) ?? null : null),
    [selectedId],
  );

  /* Opening an egg collects it. Deliberately a side effect of looking rather
     than a separate button — a "collect" action would turn browsing into
     admin, and opening the egg is already the behaviour worth rewarding. */
  const { collect } = collection;
  const lastCollected = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedEgg) return;
    if (lastCollected.current === selectedEgg.id) return;
    lastCollected.current = selectedEgg.id;
    collect(selectedEgg.id);
    if (selectedEgg.difficulty === 'Chaotic') setScareToken((t) => t + 1);
  }, [selectedEgg, collect]);

  const step = useCallback(
    (dir: -1 | 1) => {
      if (!selectedId || filteredEggs.length === 0) return;
      const i = filteredEggs.findIndex((e) => e.id === selectedId);
      if (i === -1) return;
      const next = (i + dir + filteredEggs.length) % filteredEggs.length;
      setSelectedId(filteredEggs[next].id);
    },
    [selectedId, filteredEggs],
  );

  const openRandom = useCallback(() => {
    const pool = filteredEggs.length > 0 ? filteredEggs : eggs;
    setSelectedId(pool[Math.floor(Math.random() * pool.length)].id);
  }, [filteredEggs]);

  /* "Surprise me" prefers something you haven't found yet — a random button
     that keeps handing you the same three eggs stops being a surprise. */
  const openUnfound = useCallback(() => {
    const pool = eggs.filter((e) => !collection.collected.has(e.id));
    const from = pool.length > 0 ? pool : eggs;
    setSelectedId(from[Math.floor(Math.random() * from.length)].id);
  }, [collection.collected]);

  useEffect(() => {
    const onRandom = () => openUnfound();
    window.addEventListener('eggs:random', onRandom);
    return () => window.removeEventListener('eggs:random', onRandom);
  }, [openUnfound]);

  /* Deep links. /#egg=konami-code opens straight to that egg, and the hash
     tracks the open sheet so a URL can be shared or reloaded. */
  useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(/egg=([\w-]+)/);
      if (m && eggs.some((e) => e.id === m[1])) setSelectedId(m[1]);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  useEffect(() => {
    if (selectedId) {
      if (!window.location.hash.includes(selectedId)) {
        history.replaceState(null, '', `#egg=${selectedId}`);
      }
    } else if (window.location.hash.startsWith('#egg=')) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [selectedId]);

  const languageCount = useMemo(
    () => new Set(eggs.flatMap((e) => e.snippets.map((s) => s.language))).size,
    [],
  );
  const categoryCount = useMemo(() => new Set(eggs.map((e) => e.category)).size, []);

  return (
    <Layout
      onOpenSubmission={() => setIsSubmissionOpen(true)}
      totalEggs={eggs.length}
      collected={collection.count}
      onResetCollection={collection.reset}
    >
      <MetaEggs onRandom={openRandom} total={eggs.length} />

      <Hero
        total={eggs.length}
        categories={categoryCount}
        languages={languageCount}
        collected={collection.count}
      />

      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDifficulty={selectedDifficulty}
        setSelectedDifficulty={setSelectedDifficulty}
        resultCount={filteredEggs.length}
        totalCount={eggs.length}
      />

      <section id="gallery" className="max-w-[1400px] mx-auto px-5 sm:px-8 pt-10 pb-8">
        <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredEggs.map((egg, i) => (
              <EggCard
                key={egg.id}
                egg={egg}
                index={i}
                onClick={(e) => setSelectedId(e.id)}
                hasPreview={hasPreview(egg.id)}
                collected={collection.collected.has(egg.id)}
                cracking={collection.justCracked === egg.id}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredEggs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center py-28"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'rgba(176,108,255,0.10)', border: '1px solid rgba(176,108,255,0.3)' }}
            >
              <span className="text-[22px] opacity-70">🥚</span>
            </div>
            <h3
              className="font-display text-[15px] tracking-title mb-2.5"
              style={{ color: '#fff', textShadow: '0 0 14px var(--magenta)' }}
            >
              GAME OVER — NO MATCHES
            </h3>
            <p className="text-[13px] max-w-xs leading-relaxed" style={{ color: 'var(--text-400)' }}>
              Nothing hidden under that search. Widen the filter, or submit the egg you were hoping for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDifficulty('All');
              }}
              className="mt-6 px-4 py-2 rounded-lg text-[12px] font-bold tube"
              style={{ ['--tube' as string]: 'var(--cyan)', color: 'var(--cyan)', background: 'rgba(0,229,255,0.08)' } as React.CSSProperties}
            >
              Continue?
            </button>
          </motion.div>
        )}
      </section>

      <EggDetail
        egg={selectedEgg}
        onClose={() => setSelectedId(null)}
        onPrev={filteredEggs.length > 1 ? () => step(-1) : undefined}
        onNext={filteredEggs.length > 1 ? () => step(1) : undefined}
        collectedCount={collection.count}
        total={eggs.length}
      />

      <SubmissionForm isOpen={isSubmissionOpen} onClose={() => setIsSubmissionOpen(false)} />

      <Mascot
        progress={collection.pct}
        count={collection.count}
        total={eggs.length}
        scareToken={scareToken}
      />

      {/* 60/60 */}
      <AnimatePresence>
        {collection.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[96] flex items-center justify-center pointer-events-none px-6"
            style={{ background: 'rgba(6,4,15,0.78)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
              className="text-center"
            >
              <p className="font-pixel text-[11px] tracking-eyebrow mb-5 animate-attract" style={{ color: 'var(--amber)' }}>
                ★ ALL SECRETS FOUND ★
              </p>
              <p
                className="font-display text-[13vw] sm:text-[7rem] leading-none rgb-split"
                style={{ color: '#fff', textShadow: '0 0 8px #fff, 0 0 40px var(--lime), 0 0 90px var(--lime)' }}
              >
                100%
              </p>
              <p className="mt-6 font-pixel text-[10px]" style={{ color: 'var(--lime)' }}>
                {eggs.length}/{eggs.length} · PERFECT CLEAR
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default App;
