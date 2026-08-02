import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Github, ExternalLink, Copy, Check } from 'lucide-react';
import type { Category, Difficulty } from '../data/eggs';
import { CATEGORIES, DIFFICULTIES, REPO_URL, categoryLight, difficultyLight } from '../lib/registry';

interface SubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const slug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'new-egg';

/**
 * Submission.
 *
 * The previous version was theatre: `setTimeout(() => setSubmitted(true), 1000)`
 * with no network call anywhere. It showed a green tick and threw the user's
 * contribution away. That's worse than no form at all — someone types out a
 * real easter egg, gets told "thanks for contributing", and it evaporates.
 *
 * This one composes the exact JSON object `src/data/eggs.json` expects, then
 * hands it off two ways that actually work with no backend: a prefilled
 * GitHub issue, or copy-to-clipboard for a manual PR.
 */
export const SubmissionForm: React.FC<SubmissionFormProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Web');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [tags, setTags] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    restoreRef.current = document.activeElement;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => firstRef.current?.focus(), 80);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(t);
      (restoreRef.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen, onClose]);

  /** The exact shape src/data/eggs.json expects — nothing to translate later. */
  const payload = useMemo(
    () =>
      JSON.stringify(
        {
          id: slug(title),
          title: title || 'Your Easter Egg',
          description: description || 'What it does, in one sentence.',
          category,
          difficulty,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          previewType: 'icon',
          iconName: 'Smile',
          snippets: [{ label: language, language, code: code || '// your code here' }],
        },
        null,
        2,
      ),
    [title, description, category, difficulty, tags, language, code],
  );

  const issueUrl = useMemo(() => {
    const body = [
      `### ${title || 'New easter egg'}`,
      '',
      description || '_No description provided._',
      '',
      `**Category:** ${category}  •  **Difficulty:** ${difficulty}`,
      '',
      'Proposed entry for `src/data/eggs.json`:',
      '',
      '```json',
      payload,
      '```',
      '',
      '---',
      '_Submitted from the gallery._',
    ].join('\n');

    return `${REPO_URL}/issues/new?${new URLSearchParams({
      title: `🥚 New egg: ${title || 'untitled'}`,
      body,
      labels: 'new-egg',
    }).toString()}`;
  }, [title, description, category, difficulty, payload]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1900);
    } catch { /* clipboard blocked — the textarea below is still selectable */ }
  };

  const valid = title.trim().length > 2 && description.trim().length > 5;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ background: 'rgba(6,4,15,0.85)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
          onClick={onClose}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-title"
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[620px] max-h-[92vh] overflow-hidden rounded-t-2xl sm:rounded-2xl flex flex-col"
            style={{
              background: 'linear-gradient(178deg, var(--void-200), var(--void-050) 62%)',
              border: '1px solid rgba(0,229,255,0.28)',
              boxShadow: '0 40px 120px -30px rgba(0,0,0,0.96), 0 0 60px -24px var(--cyan)',
            }}
          >
            <header
              className="relative shrink-0 px-7 pt-7 pb-5 border-b overflow-hidden"
              style={{ borderColor: 'rgba(176,108,255,0.20)' }}
            >
              <div
                className="absolute -top-20 -left-12 w-64 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.16), transparent 66%)', filter: 'blur(36px)' }}
                aria-hidden="true"
              />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-5 right-5 p-2 rounded-lg transition-colors hover:bg-white/[0.06]"
                style={{ color: 'var(--text-400)' }}
              >
                <X size={17} />
              </button>
              <p className="relative font-pixel text-[10px] tracking-eyebrow mb-3" style={{ color: 'var(--amber)' }}>
                ★ NEW CHALLENGER
              </p>
              <h2
                id="submit-title"
                className="relative font-display text-[21px] tracking-title mb-2"
                style={{ color: '#fff', textShadow: '0 0 6px #fff, 0 0 24px var(--cyan)' }}
              >
                SUBMIT AN EGG
              </h2>
              <p className="relative text-[13px] leading-relaxed" style={{ color: 'var(--text-400)' }}>
                Fill this in and it becomes a prefilled GitHub issue — or copy the JSON
                straight into <code className="font-mono text-[12px]" style={{ color: 'var(--cyan)' }}>src/data/eggs.json</code> and open a PR.
              </p>
            </header>

            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">
              <Field label="Title" hint="Short and memorable">
                <input
                  ref={firstRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Barrel Roll on Ctrl+Shift+R"
                  className="egg-input"
                />
              </Field>

              <Field label="Description" hint="One sentence — what does the user see?">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Rotates the whole page 360° when the shortcut is pressed."
                  className="egg-input resize-none"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => (
                      <Chip key={c} active={category === c} tint={categoryLight[c].tint} onClick={() => setCategory(c)}>
                        {c}
                      </Chip>
                    ))}
                  </div>
                </Field>
                <Field label="Difficulty">
                  <div className="flex flex-wrap gap-1.5">
                    {DIFFICULTIES.map((d) => (
                      <Chip key={d} active={difficulty === d} tint={difficultyLight[d].tint} onClick={() => setDifficulty(d)}>
                        {d}
                      </Chip>
                    ))}
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-[1fr_150px] gap-4">
                <Field label="Tags" hint="Comma separated">
                  <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="css, animation, keyboard" className="egg-input" />
                </Field>
                <Field label="Language">
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="egg-input">
                    {['javascript', 'typescript', 'python', 'css', 'html', 'bash', 'text'].map((l) => (
                      <option key={l} value={l} style={{ background: '#0b0b0e' }}>{l}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Code" hint="Keep it copy-pasteable and safe">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={6}
                  spellCheck={false}
                  placeholder={"document.body.style.transition = 'transform 1s';\ndocument.body.style.transform = 'rotate(360deg)';"}
                  className="egg-input font-mono text-[12px] resize-y"
                />
              </Field>

              <details className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                <summary
                  className="px-4 py-2.5 text-[11.5px] font-mono cursor-pointer select-none"
                  style={{ color: 'var(--text-400)', background: 'rgba(176,108,255,0.06)' }}
                >
                  Preview the generated JSON
                </summary>
                <pre
                  className="px-4 py-3 text-[11px] font-mono overflow-auto max-h-52"
                  style={{ color: 'var(--text-300)', background: 'var(--void-000)' }}
                >
                  {payload}
                </pre>
              </details>
            </div>

            <footer
              className="shrink-0 flex flex-col sm:flex-row gap-2.5 px-7 py-5 border-t"
              style={{ borderColor: 'rgba(176,108,255,0.20)', background: 'rgba(0,0,0,0.24)' }}
            >
              <button
                onClick={copy}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-medium transition-all duration-300"
                style={{
                  color: copied ? 'var(--lime)' : 'var(--text-300)',
                  background: 'rgba(176,108,255,0.10)',
                  border: `1px solid ${copied ? 'var(--lime)' : 'rgba(176,108,255,0.24)'}`,
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'JSON copied' : 'Copy JSON'}
              </button>

              <a
                href={valid ? issueUrl : undefined}
                target="_blank"
                rel="noreferrer noopener"
                aria-disabled={!valid}
                onClick={(e) => { if (!valid) e.preventDefault(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all duration-300"
                style={{
                  color: valid ? 'var(--void-000)' : 'var(--text-500)',
                  background: valid ? 'linear-gradient(120deg, var(--cyan), var(--magenta))' : 'rgba(176,108,255,0.08)',
                  boxShadow: valid ? '0 0 30px -8px var(--magenta)' : 'none',
                  cursor: valid ? 'pointer' : 'not-allowed',
                }}
              >
                <Github size={14} />
                Open GitHub issue
                <ExternalLink size={12} />
              </a>
            </footer>
          </motion.div>

          {/* Scoped input styling — Tailwind v4 @apply isn't available inline here. */}
          <style>{`
            .egg-input {
              width: 100%;
              border-radius: 0.6rem;
              padding: 0.6rem 0.8rem;
              font-size: 13px;
              color: var(--text-100);
              background: var(--void-150);
              border: 1px solid rgba(176,108,255,0.22);
              outline: none;
              transition: border-color .25s, box-shadow .25s;
            }
            .egg-input::placeholder { color: var(--text-500); }
            .egg-input:focus {
              border-color: var(--cyan);
              box-shadow: 0 0 18px -4px var(--cyan);
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block">
    <span className="flex items-baseline gap-2 mb-2">
      <span className="font-pixel text-[10px] tracking-eyebrow uppercase" style={{ color: 'var(--text-400)' }}>
        {label}
      </span>
      {hint && <span className="text-[11px]" style={{ color: 'var(--text-500)' }}>{hint}</span>}
    </span>
    {children}
  </label>
);

const Chip: React.FC<{ active: boolean; tint: string; onClick: () => void; children: React.ReactNode }> = ({
  active, tint, onClick, children,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className="px-2.5 py-1 rounded-full text-[11.5px] font-medium transition-all duration-300"
    style={{
      color: active ? tint : 'var(--text-400)',
      background: active ? `${tint}20` : 'rgba(176,108,255,0.07)',
      border: `1px solid ${active ? tint : 'rgba(176,108,255,0.18)'}`,
      boxShadow: active ? `0 0 14px -5px ${tint}` : 'none',
    }}
  >
    {children}
  </button>
);
