import type { CSSProperties } from 'react';

/**
 * "Neon Cabinet" — a Prism theme for an emissive surface.
 *
 * On a dark violet ground the usual pastel syntax palettes go muddy, because
 * pastels are pigments — they assume light falls *on* them. Here the glyphs
 * are the light source, so every colour is taken at full saturation and the
 * hierarchy is carried by brightness instead:
 *
 *   keywords   magenta, with a faint bloom   the loudest thing on screen
 *   strings    lime                          the one cool-adjacent note
 *   functions  cyan                          scanned second
 *   numbers    amber
 *   comments   dim violet, ~3:1              skippable by design
 *
 * Only keywords get a text-shadow. If everything glows, nothing does — the
 * bloom is a hierarchy tool, not a texture.
 */

type Style = Record<string, CSSProperties>;

const base: CSSProperties = {
  color: '#cdc7ee',
  background: 'none',
  fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
  fontSize: '12.5px',
  lineHeight: 1.75,
  direction: 'ltr',
  textAlign: 'left',
  whiteSpace: 'pre',
  wordSpacing: 'normal',
  wordBreak: 'normal',
  tabSize: 2,
  hyphens: 'none',
};

export const neonCabinet: Style = {
  'code[class*="language-"]': base,
  'pre[class*="language-"]': {
    ...base,
    padding: '1.15rem 1.25rem',
    margin: 0,
    overflow: 'auto',
    background: 'transparent',
  },

  comment: { color: '#8c82ab', fontStyle: 'italic' },
  prolog: { color: '#8c82ab' },
  doctype: { color: '#8c82ab' },
  cdata: { color: '#8c82ab' },

  punctuation: { color: '#9a92c0' },
  operator: { color: '#b06cff' },

  property: { color: '#00e5ff' },
  'attr-name': { color: '#00e5ff' },
  tag: { color: '#ff2d95' },
  'attr-value': { color: '#7cff4f' },

  boolean: { color: '#ffd23f' },
  number: { color: '#ffd23f' },
  constant: { color: '#ffd23f' },
  symbol: { color: '#ffd23f' },

  string: { color: '#7cff4f' },
  char: { color: '#7cff4f' },
  'template-string': { color: '#7cff4f' },
  url: { color: '#7cff4f', textDecoration: 'underline' },

  keyword: { color: '#ff2d95', fontWeight: 500, textShadow: '0 0 10px rgba(255,45,149,0.45)' },
  atrule: { color: '#ff2d95' },
  rule: { color: '#ff2d95' },
  important: { color: '#ff4d4d', fontWeight: 600 },

  function: { color: '#00e5ff' },
  'function-variable': { color: '#00e5ff' },
  'class-name': { color: '#b06cff' },
  builtin: { color: '#b06cff' },

  variable: { color: '#cdc7ee' },
  parameter: { color: '#b3abd8' },
  regex: { color: '#ff7a3d' },
  selector: { color: '#00e5ff' },
  entity: { color: '#ffd23f', cursor: 'help' },

  inserted: { color: '#7cff4f' },
  deleted: { color: '#ff4d4d' },

  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },
  namespace: { opacity: 0.7 },
};
