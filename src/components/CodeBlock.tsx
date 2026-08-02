import React, { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { neonCabinet } from '../lib/arcadeCodeTheme';

interface CodeBlockProps {
  code: string;
  language: string;
  label?: string;
}

/**
 * Code, presented as a physical strip of film: a header bar with the label
 * and the copy affordance, then the frame itself.
 *
 * The copy button confirms with a green check that holds for 1.8s. Anything
 * shorter and a user who glanced away misses the only feedback the action
 * ever gives.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, label }) => {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API is unavailable over plain HTTP and in some embeds.
      // Fail visibly rather than silently doing nothing.
      setFailed(true);
      setTimeout(() => setFailed(false), 2200);
    }
  }, [code]);

  const lines = code.split('\n').length;

  return (
    <figure
      className="relative rounded-xl overflow-hidden"
      style={{
        background: 'var(--void-050)',
        border: '1px solid rgba(176,108,255,0.22)',
      }}
    >
      <figcaption
        className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: 'rgba(176,108,255,0.18)', background: 'rgba(6,4,15,0.5)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Three lights, wired as tubes. On an emissive surface these can
              be fully saturated — a dim traffic-light trio would read as
              three dead LEDs. */}
          <span className="flex gap-1.5 shrink-0" aria-hidden="true">
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--magenta)', boxShadow: '0 0 6px var(--magenta)' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--amber)', boxShadow: '0 0 6px var(--amber)' }} />
            <span className="w-2 h-2 rounded-full" style={{ background: 'var(--lime)', boxShadow: '0 0 6px var(--lime)' }} />
          </span>
          <span
            className="text-[11px] font-mono tracking-wider uppercase truncate"
            style={{ color: 'var(--text-400)' }}
          >
            {label || language}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono hidden sm:block" style={{ color: 'var(--text-500)' }}>
            {lines} {lines === 1 ? 'line' : 'lines'}
          </span>
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy code to clipboard'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-300"
            style={{
              color: copied ? 'var(--lime)' : failed ? 'var(--hot)' : 'var(--text-400)',
              background: copied ? 'rgba(124,255,79,0.12)' : 'rgba(176,108,255,0.10)',
              border: `1px solid ${copied ? 'rgba(124,255,79,0.45)' : 'rgba(176,108,255,0.22)'}`,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.24, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex"
                >
                  <Check size={12} />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex"
                >
                  <Copy size={12} />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="hidden sm:inline">{copied ? 'Copied' : failed ? 'Blocked' : 'Copy'}</span>
          </button>
        </div>
      </figcaption>

      <div className="relative max-h-[430px] overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={neonCabinet}
          customStyle={{ margin: 0, background: 'transparent', padding: '1.15rem 1.25rem' }}
          codeTagProps={{ style: { fontFamily: 'inherit', fontSize: 'inherit' } }}
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>

        {/* Fade at the bottom edge, so a clipped block reads as "more below"
            rather than as a hard cut. */}
        <div
          className="sticky bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(0deg, var(--void-050), transparent)' }}
          aria-hidden="true"
        />
      </div>
    </figure>
  );
};
