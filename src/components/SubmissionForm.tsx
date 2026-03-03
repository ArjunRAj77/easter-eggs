import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

interface SubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-4"
                  >
                    <CheckCircle size={32} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Egg Submitted!</h3>
                  <p className="text-slate-400">Thanks for contributing to the collection.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Submit an Egg</h2>
                  <p className="text-slate-400 text-sm mb-6">
                    Found a cool easter egg? Share it with the community.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 transition-all"
                        placeholder="e.g. Konami Code"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                          Category
                        </label>
                        <select className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 transition-all appearance-none">
                          <option>Web</option>
                          <option>Mobile</option>
                          <option>Game</option>
                          <option>CLI</option>
                          <option>Desktop</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                          Difficulty
                        </label>
                        <select className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 transition-all appearance-none">
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Chaotic</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                        Description
                      </label>
                      <textarea
                        required
                        rows={3}
                        className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 transition-all resize-none"
                        placeholder="What does it do?"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                        Code Snippet
                      </label>
                      <textarea
                        required
                        rows={4}
                        className="w-full bg-[#020617] border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#818cf8]/50 transition-all resize-none"
                        placeholder="// Paste your code here..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#818cf8] hover:bg-[#6366f1] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      <Send size={18} />
                      Submit Egg
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
