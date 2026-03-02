import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Terminal, Code, Monitor, Smartphone, Globe, Gamepad2, Zap, Ghost, Skull, Smile } from 'lucide-react';
import { EasterEgg, CodeSnippet } from '../data/eggs';
import { CodeBlock } from './CodeBlock';
import clsx from 'clsx';

interface EggDetailProps {
  egg: EasterEgg | null;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
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

export const EggDetail: React.FC<EggDetailProps> = ({ egg, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!egg) return null;

  const Icon = iconMap[egg.iconName] || Smile;

  return (
    <AnimatePresence>
      {egg && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              layoutId={`card-${egg.id}`}
              className="bg-[#1e293b] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[600px]">
                {/* Left: Info & Preview */}
                <div className="p-8 md:p-12 flex flex-col bg-gradient-to-br from-[#1e293b] to-[#0f172a]">
                  <div className="mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#818cf8]/10 flex items-center justify-center text-[#818cf8] mb-6 border border-[#818cf8]/20 shadow-lg shadow-indigo-500/10">
                      <Icon size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{egg.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-medium text-slate-400">
                        {egg.category}
                      </span>
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-medium border",
                        egg.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        egg.difficulty === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                        "bg-red-500/10 text-red-400 border-red-500/20"
                      )}>
                        {egg.difficulty}
                      </span>
                    </div>
                    <p className="text-slate-400 leading-relaxed text-lg">
                      {egg.description}
                    </p>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Zap size={16} className="text-yellow-400" />
                      Pro Tip
                    </h3>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-sm text-slate-300 italic">
                      "Best used sparingly. Easter eggs lose their charm if they're everywhere."
                    </div>
                  </div>
                </div>

                {/* Right: Code */}
                <div className="bg-[#0f172a] border-l border-white/5 flex flex-col">
                  <div className="flex items-center border-b border-white/5 overflow-x-auto no-scrollbar">
                    {egg.snippets.map((snippet, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={clsx(
                          "px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                          activeTab === index
                            ? "border-[#818cf8] text-white bg-white/5"
                            : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                      >
                        {snippet.label}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex-grow overflow-y-auto max-h-[600px]">
                    {egg.snippets[activeTab] && (
                      <CodeBlock
                        code={egg.snippets[activeTab].code}
                        language={egg.snippets[activeTab].language}
                        label={egg.snippets[activeTab].label}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
