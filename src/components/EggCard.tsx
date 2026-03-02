import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Gamepad2, Terminal, Smartphone, Globe, Monitor, Zap, Ghost, Skull, Smile, LucideIcon } from 'lucide-react';
import { EasterEgg, Category, Difficulty } from '../data/eggs';
import clsx from 'clsx';

interface EggCardProps {
  egg: EasterEgg;
  onClick: (egg: EasterEgg) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Gamepad2,
  Terminal,
  Smartphone,
  Globe,
  Monitor,
  Zap,
  Ghost,
  Skull,
  Smile
};

const categoryColors: Record<Category, string> = {
  Web: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Mobile: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Game: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLI: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Desktop: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'text-emerald-400',
  Medium: 'text-yellow-400',
  Chaotic: 'text-red-400',
};

export const EggCard: React.FC<EggCardProps> = ({ egg, onClick }) => {
  const Icon = iconMap[egg.iconName] || Smile;

  return (
    <motion.div
      layoutId={`card-${egg.id}`}
      onClick={() => onClick(egg)}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-[#1e293b] rounded-2xl p-6 border border-white/5 hover:border-white/10 cursor-pointer transition-colors overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={clsx(
            "p-3 rounded-xl border backdrop-blur-sm",
            categoryColors[egg.category]
          )}>
            <Icon size={24} />
          </div>
          <span className={clsx(
            "text-xs font-medium px-2 py-1 rounded-full bg-white/5 border border-white/5",
            difficultyColors[egg.difficulty],
            egg.difficulty === 'Chaotic' && "group-hover:animate-shake"
          )}>
            {egg.difficulty}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#818cf8] transition-colors">
          {egg.title}
        </h3>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
          {egg.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <span className="text-xs text-slate-500 font-mono">
            {egg.category}
          </span>
          <div className="flex items-center gap-1 text-xs font-medium text-[#818cf8] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
            View Code <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
