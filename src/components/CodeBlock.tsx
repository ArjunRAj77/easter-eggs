import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeBlockProps {
  code: string;
  language: string;
  label?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, label }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden bg-[#0f172a] border border-white/5">
      <div className="flex items-center justify-between px-4 py-2 bg-[#020617]/50 border-b border-white/5">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
          {label || language}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          title="Copy code"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Check size={14} className="text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Copy size={14} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            fontFamily: 'var(--font-mono)',
          }}
          wrapLines={true}
          showLineNumbers={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      {copied && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-4 right-4 bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-sm"
        >
          Copied to clipboard!
        </motion.div>
      )}
    </div>
  );
};
