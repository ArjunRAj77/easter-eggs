/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { FilterBar } from './components/FilterBar';
import { EggCard } from './components/EggCard';
import { EggDetail } from './components/EggDetail';
import { SubmissionForm } from './components/SubmissionForm';
import { eggs, EasterEgg, Category, Difficulty } from './data/eggs';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Plus } from 'lucide-react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');
  const [selectedEgg, setSelectedEgg] = useState<EasterEgg | null>(null);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  // Konami Code Listener for the site itself
  useEffect(() => {
    const sequence = [
      'ArrowUp', 'ArrowUp', 
      'ArrowDown', 'ArrowDown', 
      'ArrowLeft', 'ArrowRight', 
      'ArrowLeft', 'ArrowRight', 
      'b', 'a'
    ];
    let position = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === sequence[position]) {
        position++;
        if (position === sequence.length) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
          position = 0;
        }
      } else {
        position = 0;
      }
    };

    const handleRandomEgg = () => {
      const randomEgg = eggs[Math.floor(Math.random() * eggs.length)];
      setSelectedEgg(randomEgg);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('openRandomEgg', handleRandomEgg);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openRandomEgg', handleRandomEgg);
    };
  }, []);

  const filteredEggs = eggs.filter((egg) => {
    const matchesSearch = egg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          egg.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || egg.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || egg.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <Layout onOpenSubmission={() => setIsSubmissionOpen(true)}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <div className="min-h-screen pb-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden py-20 sm:py-32 border-b border-white/5">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight mb-6">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Easter Egg</span> Gallery
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                A curated collection of delightful code snippets to hide in your projects. 
                Copy, paste, and surprise your users.
              </p>
            </motion.div>
          </div>
        </div>

        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredEggs.map((egg) => (
                <EggCard
                  key={egg.id}
                  egg={egg}
                  onClick={setSelectedEgg}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredEggs.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <span className="text-2xl">🥚</span>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No eggs found</h3>
              <p className="text-slate-400">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      <EggDetail
        egg={selectedEgg}
        onClose={() => setSelectedEgg(null)}
      />

      <SubmissionForm
        isOpen={isSubmissionOpen}
        onClose={() => setIsSubmissionOpen(false)}
      />
    </Layout>
  );
}

export default App;
