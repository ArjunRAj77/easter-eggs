import React from 'react';
import { Github, Twitter, Coffee } from 'lucide-react';
import { StarBackground } from './StarBackground';

interface LayoutProps {
  children: React.ReactNode;
  onOpenSubmission?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onOpenSubmission }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-[#818cf8] selection:text-white relative">
      <StarBackground />
      <nav className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
              E
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Easter Eggs<span className="text-[#818cf8]">🥚</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={onOpenSubmission}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block"
            >
              Submit Egg
            </button>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">
              About
            </a>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-[#1DA1F2] transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative">
        {children}
      </main>

      <footer className="border-t border-white/5 py-12 mt-20 bg-[#020617] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Easter Eggs🥚. Built for developers.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">
              Privacy
            </a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">
              Terms
            </a>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openRandomEgg'))}
              className="text-slate-500 hover:text-[#818cf8] transition-colors text-sm"
            >
              Surprise Me
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
