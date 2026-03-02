import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Category, Difficulty } from '../data/eggs';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category | 'All';
  setSelectedCategory: (category: Category | 'All') => void;
  selectedDifficulty: Difficulty | 'All';
  setSelectedDifficulty: (difficulty: Difficulty | 'All') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
}) => {
  const categories: (Category | 'All')[] = ['All', 'Web', 'Mobile', 'Game', 'CLI', 'Desktop'];
  const difficulties: (Difficulty | 'All')[] = ['All', 'Easy', 'Medium', 'Chaotic'];

  return (
    <div className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 py-4 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search */}
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#818cf8] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search easter eggs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 focus:border-[#818cf8]/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <div className="flex items-center gap-2 pr-4 border-r border-white/10 mr-2">
              <Filter size={16} className="text-slate-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Type</span>
            </div>
            
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-[#818cf8] text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
