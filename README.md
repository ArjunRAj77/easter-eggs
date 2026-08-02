<div align="center">

# ✦ Easter Eggs

**An arcade cabinet full of developer secrets.**

*Insert coin. Sixty secrets to find.*

60 hand-curated easter eggs · 60 playable previews · 5 worlds · 7 languages · 63 copy-pasteable snippets — every one of them running, in the browser, before you paste a line

`React 19` · `TypeScript` · `Vite 6` · `Tailwind CSS 4` · `Motion` · `Canvas 2D` · `WebAudio` — no backend, no accounts, no tracking

</div>
---

## Table of contents

1. [Features](#features)
2. [Quick start](#quick-start)
3. [Architecture](#architecture)
4. [Folder structure](#folder-structure)
5. [The screen](#the-screen)
6. [The look](#the-look)
7. [Collect all 60](#collect-all-60)
8. [Worlds & risk](#worlds--risk)
9. [Controls](#controls)
10. [The preview system](#the-preview-system)
11. [Hidden meta-eggs](#hidden-meta-eggs)
12. [Adding an egg](#adding-an-egg)
13. [Contributing](#contributing)
14. [Troubleshooting](#troubleshooting)
15. [Changelog](#changelog)

---

## Features

- **Everything is playable** — all 60 eggs run in a 260px cabinet screen before you copy anything. A playable T-Rex runner, self-playing Pong, the Doom fire algorithm in ASCII, Matrix rain, a warp-speed starfield, a DVD logo that counts its own corner hits, a cursor-chasing cat, xeyes, and a lightsaber trail with four blade colours.
- **Collect all 60** — opening an egg cracks it and adds it to your jar. Progress lives in the header, in the mascot, and in `localStorage`. There's a perfect-clear screen at 60/60.
- **Yolk, the mascot** — an egg in the corner who tracks your cursor with a few frames of lag, blinks on a Poisson schedule, flinches when you open something Chaotic, falls asleep if you idle, and hatches when you finish the set.
- **Neon, not paint** — the whole interface is emissive. Borders are tubes, the title is a sign with a white-hot core inside a cyan-and-magenta bloom, and the marquee strikes with a stutter because real neon never just turns on.
- **Cards you can feel** — 7° pointer tilt, squash on press, a glare that tracks across the bezel, and a spring-loaded deal into the grid.
- **No assets, anywhere** — every sound is synthesised live with WebAudio, every graphic is Canvas or CSS. Nothing to 404 on a fresh clone, nothing to license.
- **Copy-pasteable by design** — 63 snippets across JavaScript, TypeScript, Python, CSS, HTML, Bash and plain text, in a "Neon Cabinet" Prism theme where hierarchy is carried by brightness rather than pastel hue.
- **Real filtering** — search across titles, descriptions *and* tags, filter by world and risk, with a live count announced to screen readers.
- **Deep links** — `#egg=konami-code` opens straight to an egg, and the hash follows the open sheet so any secret can be shared.
- **Keyboard-first** — `⌘K` or `/` to search, `←` `→` to walk the gallery, `Esc` to close, full focus trap, focus restoration, and a skip link as the first tab stop.
- **Meta-eggs** — Konami, `42`, `crt`, `grain`, a pixel ghost that drifts past after 45 seconds of stillness, and a real `window.eggs` API in the console.
- **Submissions that go somewhere** — the form composes the exact JSON `eggs.json` expects and hands it to a prefilled GitHub issue or your clipboard.
- **Respects `prefers-reduced-motion`** — the scroll roll, the grid, the sparks and every entrance animation stand down completely.

## Quick start

**Prerequisites:** Node 18+.

```bash
cd easter-eggs
npm install
npm run dev          # → http://localhost:3000
```

No API keys. No environment variables. No database.

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Vite dev server on port 3000 with HMR         |
| `npm run build`   | Production bundle to `dist/`                  |
| `npm run preview` | Serve the built bundle locally                |
| `npm run lint`    | `tsc --noEmit` — full strict typecheck        |
| `npm run clean`   | Remove `dist/`                                |

The output is a static bundle — drop `dist/` on any static host.

## Architecture

```
Browser
  index.html — stage paint, SEO + OG meta, inline SVG favicon
    └── src/main.tsx
          └── App.tsx            filter state · deep links · collection
                ├── Layout.tsx         nav, score plate, ticker, CRT layers
                │     └── Backdrop.tsx   synthwave grid, sun, pixel sparks
                ├── Hero.tsx           neon marquee, stat tubes
                ├── FilterBar.tsx      search · world · risk
                ├── EggCard.tsx        3D tilt · squash · tube glow
                ├── EggDetail.tsx      focus-trapped sheet, preview + code
                │     ├── previews/      60 playable demos
                │     └── CodeBlock.tsx  Prism, "Neon Cabinet" theme
                ├── SubmissionForm.tsx GitHub issue composer
                ├── Mascot.tsx         Yolk — eyes, blinks, moods, hatching
                └── MetaEggs.tsx       konami · 42 · crt · grain · drifter

  src/data/eggs.json    — the entire catalogue. Content, not code.
  src/lib/collection.ts — localStorage jar, keyed by egg id
```

**Five design principles**

1. **Content is data, not code.** Every egg — title, description, world, risk, tags, snippets — lives in `src/data/eggs.json`. Add an object and the gallery, counts, filters, search index and hero stats all update on reload.
2. **Everything emits.** There is no key light, no rim, no specular, because there's no external source — the surfaces *are* the phosphor. That one inversion is why the page reads as a lit cabinet rather than a dark website, and it's why every glow is layered rather than flat.
3. **A preview is a promise.** If an egg is in the catalogue, it runs. "Preview not available" is a broken promise on a page whose entire pitch is *play it before you paste it*.
4. **Progress is a character, not a widget.** The mascot's shell cracks as the jar fills, so the progress bar and the personality are the same object. One thing to look at, two jobs done.
5. **Nothing over the wire.** No backend, no accounts, no analytics, no asset CDN. Google Fonts is the only third-party request, and the layout survives it being blocked.

## Folder structure

```
easter-eggs/
├── index.html                    # stage paint, meta, inline favicon
├── src/
│   ├── main.tsx
│   ├── App.tsx                   # filtering, deep links, collection wiring
│   ├── index.css                 # THE DESIGN SYSTEM — tokens, CRT optics, motion
│   ├── data/
│   │   ├── eggs.json             #   the catalogue (60 eggs) — edit this
│   │   └── eggs.ts               #   types + typed export
│   ├── lib/
│   │   ├── registry.ts           #   icon map, world & risk tubes
│   │   ├── collection.ts         #   localStorage jar + useCollection()
│   │   └── arcadeCodeTheme.ts    #   "Neon Cabinet" Prism theme
│   └── components/
│       ├── Backdrop.tsx          #   synthwave grid, sliced sun, sparks
│       ├── Layout.tsx            #   nav, score plate, ticker, CRT plates
│       ├── Hero.tsx              #   neon marquee
│       ├── FilterBar.tsx         #   search + world + risk
│       ├── EggCard.tsx           #   tilt, squash, glare, collected state
│       ├── EggDetail.tsx         #   modal sheet
│       ├── CodeBlock.tsx         #   syntax highlighting + copy
│       ├── SubmissionForm.tsx    #   GitHub issue composer
│       ├── Mascot.tsx            #   Yolk
│       ├── MetaEggs.tsx          #   the site's own secrets
│       └── previews/
│           ├── index.tsx         #     id → preview registry (all 60)
│           ├── primitives.tsx    #     Stage, EffectStage, terminal, console, synth
│           └── interactive.tsx   #     the bespoke demos
├── vite.config.ts
├── tsconfig.json                 # strict
└── package.json
```

Google Fonts (Chakra Petch, Space Grotesk, Silkscreen, JetBrains Mono) load from a CDN; everything else is local.

## The screen

- **Header** — wordmark with a blinking egg, the **score plate** (`07/60` and a cyan→magenta progress tube), *Random*, *Submit*, repo links. Sticky, with a neon tube underneath.
- **Hero** — an attract-mode prompt, the two-word neon marquee striking half a second apart, and four stat tubes: secrets, worlds, languages, found.
- **Control panel** — sticky at 68px, directly beneath the header. Search on the left (`⌘K` / `/`), world select in the middle, risk on the right, pixel-font read-out below.
- **Gallery** — a 1/2/3-column grid of cabinet tiles that tilt toward your pointer. Collected eggs keep a lit border and a lime tick; `Chaotic` badges shake on hover.
- **Detail sheet** — the page behind drops to a heavy blur. Playable preview and tags on the left, language tabs and the code block on the right, `FOUND n/60` in the footer.
- **Yolk** — bottom-left, watching. Click to poke, double-click to dismiss.
- **Footer** — a scrolling attract-mode ticker of every secret command on the site.

## The look

The interface is an arcade cabinet, and every decision follows from one inversion: **nothing here is lit, everything emits.**

| Element | Role | Notes |
| ------- | ---- | ----- |
| Cyan `#00e5ff` | **The UI voice** | Search focus, primary actions, the first word of the marquee. |
| Magenta `#ff2d95` | **Energy & reward** | Progress, chaos, keywords in code, the second word of the marquee. |
| `#06040f` → `#453a75` | **The cabinet** | Violet-black, never neutral. A dead CRT has a purple cast and every neon in the room bounces into it. |
| Amber / lime / violet | **Worlds** | Fully saturated — on an emissive surface a desaturated colour just reads as a dead pixel. |
| Neon text | **Tubes** | White-hot core inside a coloured halo, three stacked shadows. A single coloured shadow is just a blurry letter. |
| RGB split | **Misregistration** | 2px, red left, cyan right. Past ~3px it stops reading as a screen and starts reading as a 3D anaglyph. |
| Scanlines | **Raster** | 3px pitch — 1px dark, 2px clear. A 2px pitch moirés against body text; 4px reads as blinds. |
| Roll bar | **Sync drift** | A slow luminance band, 9s top to bottom. The tell of a monitor slightly out of sync. |
| Synthwave grid | **Depth** | Horizontal lines spaced by a quadratic, not linearly. Evenly spaced lines read as a ladder lying down; correct spacing reads as a floor. |

**Contrast floor.** Every text stop clears WCAG AA (4.5:1) against `--void-200`, the lightest surface any of them sits on — worst case is the micro-label stop at 4.63:1. Saturated dark grounds are unusually good at making dim text *look* deliberate when it's actually just unreadable, so the ramp is measured rather than eyeballed. Silkscreen never renders below 10px: it's a bitmap face and below its glyph grid it mushes regardless of contrast.

Motion overshoots on purpose — `cubic-bezier(0.34, 1.7, 0.5, 1)`. Nothing in a good game eases politely into place. Cards deal in on a spring with a 26ms stagger, buttons depress on tap, and the marquee tubes strike with a stutter.

## Collect all 60

Opening an egg cracks it and drops it in your jar. That's the whole loop, and it's enough — the reward is the one that makes every achievement list work: a number that only goes up, and a visible gap you want to close.

- **Collecting is a side effect of looking**, never a separate button. A "collect" action would turn browsing into admin; opening the egg is already the behaviour worth rewarding.
- **Stored by egg id, never by index.** The catalogue is community-edited — reordering `eggs.json` must not silently rewrite someone's progress.
- **Three places show it**: the header score plate, Yolk's cracking shell, and the `FOUND n/60` plate in the detail footer.
- **`Random`** prefers eggs you haven't found yet. A shuffle button that keeps handing you the same three eggs stops being a surprise.
- **Reset** from the ↺ next to the score plate. At 60/60 you get a perfect-clear screen.

State lives in `localStorage` under `easter-eggs:collected:v1` and syncs across tabs. An unreadable jar is an empty jar — private mode never throws.

## Worlds & risk

| World | Tube | What lives here |
| ----- | ---- | --------------- |
| **Web** | cyan | Browser tricks — Konami, barrel rolls, CSS filters, canvas toys |
| **Mobile** | violet | Device-motion and touch |
| **Game** | lime | Playable things |
| **CLI** | amber | `cowsay`, `sl`, `fortune`, `cmatrix`, `aafire`, ASCII Star Wars |
| **Desktop** | magenta | X11 and window-manager classics — `oneko`, `xeyes` |

| Risk | Tube | Meaning |
| ---- | ---- | ------- |
| **Easy** | lime | Drop it in. A few lines, no dependencies. |
| **Medium** | amber | Some wiring — a listener, a canvas, a bit of state. |
| **Chaotic** | magenta | Ships chaos. The badge shakes on hover, and Yolk flinches. |

## Controls

| Input | Action |
| ----- | ------ |
| `⌘K` / `Ctrl+K` / `/` | Focus search |
| `Esc` | Clear search · close the sheet |
| Click a card, or `Enter` / `Space` | Open it — and collect it |
| `←` `→` | Previous / next egg (inside the sheet) |
| `Tab` | Fully trapped inside an open sheet, restored on close |
| Click Yolk | Poke |
| Double-click Yolk | Dismiss for the session |
| `↑↑↓↓←→←→BA` | 30 lives |
| Type `42` | The answer |
| Type `crt` | Cabinet mode |
| Type `grain` | Cycle the tube |

## The preview system

Three layers, in `src/components/previews/`:

- **`primitives.tsx`** — the shared furniture. `Stage` (a recessed cabinet screen with a tally light — violet when armed, lime when running), `EffectStage` (applies any CSS transform or filter to a miniature product UI on demand), `FauxTerminal` (types a command, then the output), `FauxConsole`, `CanvasStage` (DPR-aware, resize-observed, reduced-motion-aware) and `useSynth` — a small WebAudio synth with a 6ms attack and exponential tails, because a hard gate clicks.
- **`interactive.tsx`** — the bespoke demos. Playable T-Rex, self-playing Pong, Doom fire, Matrix rain, warp starfield, DVD bouncer, Thanos dissolve, lightsaber trail, oneko, xeyes, zerg rush, CRT with a rolling refresh bar, and more.
- **`index.tsx`** — the registry. One `id → () => ReactElement` map, plus `hasPreview(id)`.

Terminal transcripts live at **module scope** on purpose: `FauxTerminal` keys its typing animation off array identity, so an inline literal would restart the animation on every render.

To give a new egg a preview, add one line to `previewRegistry`. Anything not in the map falls back to `NoPreview` — currently nothing does.

## Hidden meta-eggs

| Trigger | What happens |
| ------- | ------------ |
| `↑↑↓↓←→←→BA` | Two corner cannons of neon confetti, and a **30 LIVES** title card |
| Type `42` | The answer, at 15rem, with RGB split |
| Type `crt` | Cabinet mode — 2.39:1 bars slide in, vignette to 0.92, scanlines up |
| Type `grain` | Cycles the tube: crisp LCD → arcade CRT → dying monitor |
| Idle 45s | A pixel ghost drifts across the screen, and Yolk falls asleep |
| Collect 1 / 10 / 25 / 30 / 45 / 59 | Yolk has something to say about it |
| Collect all 60 | Perfect clear, and Yolk hatches |
| Open the console | A banner, and a real `window.eggs` API: `random()`, `cinema()`, `list()`, `answer` |

Sequence capture is suppressed whenever an input has focus, so typing "cr" in the search box never gets you halfway to cabinet mode.

## Adding an egg

All content lives in **`src/data/eggs.json`**. Add an object:

```json
{
  "id": "unique-id-slug",
  "title": "Easter Egg Title",
  "description": "One sentence — what does the user actually see?",
  "category": "Web",
  "difficulty": "Easy",
  "tags": ["css", "animation"],
  "previewType": "icon",
  "iconName": "Smile",
  "snippets": [
    {
      "label": "React",
      "language": "typescript",
      "code": "// your code here"
    }
  ]
}
```

| Field | Values |
| ----- | ------ |
| `category` | `Web` · `Mobile` · `Game` · `CLI` · `Desktop` |
| `difficulty` | `Easy` · `Medium` · `Chaotic` |
| `iconName` | Any key in `iconMap` (`src/lib/registry.ts`) — falls back to `Egg` |
| `language` | `javascript` · `typescript` · `python` · `css` · `html` · `bash` · `text` |

Then optionally add a preview in `src/components/previews/index.tsx`. For a CSS effect that's one line:

```tsx
'my-egg': () => (
  <EffectStage label="Do the thing" css={{ filter: 'sepia(1)' }} hint="One line of CSS." />
),
```

The in-app **Submit** form generates all of this for you and opens a prefilled GitHub issue.

## Contributing

1. Fork, branch, add your object to `src/data/eggs.json`.
2. Register a preview if you can — `EffectStage`, `FauxTerminal` and `FauxConsole` cover most cases in a few lines.
3. `npm run lint` must pass clean (strict TypeScript).
4. Open a PR describing what your egg does.

**Guidelines** — keep it safe (no malicious code, nothing destructive to real user data), keep it copy-pasteable (no build step, no exotic dependencies), categorise honestly, and respect `prefers-reduced-motion` in anything that moves.

## Troubleshooting

| Symptom | Likely cause / fix |
| ------- | ------------------ |
| `Cannot find module 'framer-motion'` | You're on an old `node_modules`. This project imports from `motion/react`; run `npm install` again after pulling. |
| Nothing renders, console shows a module error | Dependencies changed substantially in v1.0 and `package-lock.json` was regenerated — delete `node_modules` and reinstall. |
| Previews are silent | Browsers block `AudioContext` until the first user gesture. Click the trigger button once; the synth is created lazily on that gesture. |
| My collection vanished | `localStorage` is per-origin — a different port or domain is a different jar. Also check you didn't hit ↺ next to the score plate. |
| Progress won't save at all | Private/incognito windows block `localStorage`. The session still works; it just won't persist. |
| Everything is still, no grid, no scanline roll | You have `prefers-reduced-motion: reduce` set. That's honoured on purpose. |
| Cards don't tilt | Tilt is pointer-driven — it doesn't fire on touch devices, by design. |
| Fonts look wrong | Chakra Petch, Space Grotesk, Silkscreen and JetBrains Mono load from Google Fonts. If blocked, system fallbacks are used and the layout holds. |
| Copy button says **Blocked** | The Clipboard API needs a secure context. Serve over HTTPS or `localhost`. |
| Stuck in cabinet mode | Type `crt` again, or run `eggs.cinema()` in the console. |
| Yolk is gone | You double-clicked. Reload to bring the mascot back. |

## Changelog

**v1.1 — arcade edition**

- **Re-graded the entire interface from noir to arcade.** The lighting model is inverted: nothing is lit any more, everything emits. Rim lights became neon tubes, the reflective specular became an emissive glare, and the warm-gold key light was replaced by a two-tone cyan/magenta cabinet. Chakra Petch + Space Grotesk + Silkscreen replace Cinzel + Inter.
- **CRT treatment** — 3px scanlines, a 9-second roll bar, corner falloff on curved glass, and 2px RGB misregistration on display type.
- **New backdrop** — a synthwave perspective grid with quadratic line spacing, a sliced sun on the horizon, and drifting square pixel sparks.
- **Collect all 60** — opening an egg cracks it into a `localStorage` jar keyed by egg id. Score plate in the header, a perfect-clear screen at 60/60, cross-tab sync, and a reset.
- **Yolk, the mascot** — cursor tracking with deliberate lag, Poisson blinking, squash-and-stretch on every state change, a shell that cracks in four stages as the jar fills, milestone dialogue, and a hatch at 100%.
- **Cards are physical** — 7° pointer tilt, squash on press, a glare that tracks the bezel, and a spring-loaded deal into the grid. All driven through CSS custom properties, so there's no re-render per frame at 60 cards.
- **`Random` now prefers eggs you haven't found.**
- **"Neon Cabinet" Prism theme** replaces "Noir Gold" — hierarchy carried by brightness rather than pastel hue, and only keywords get a bloom.
- Meta-eggs updated: `noir` → `crt`, the film-grain cycle became a tube cycle, the moth became a pixel ghost, and the confetti went neon.

**v1.0 — the rebuild**

- **Every egg now has a live preview** — 60 of 60, up from 9. New preview architecture: `Stage` / `EffectStage` / `FauxTerminal` / `FauxConsole` / `CanvasStage` primitives, a WebAudio synth, and a registry keyed by egg id.
- **Fixed: the difficulty filter never rendered.** The state, props and filter predicate all existed; no UI ever exposed them, so a third of the filtering logic was unreachable.
- **Fixed: two sticky bars both pinned to `top-0`**, so the filter strip slid under the nav on scroll.
- **Fixed: search ignored tags**, which were indexed in the data and rendered on every card.
- **Fixed: `framer-motion` was imported in five files but was never a dependency.** Migrated to `motion/react`, which *is* installed.
- **Fixed: the submission form was theatre** — a `setTimeout` that showed a green tick and discarded the user's contribution. It now composes the exact `eggs.json` object and opens a prefilled GitHub issue.
- **Fixed: the icon map was duplicated** verbatim in two components, so an icon added to one silently fell back in the other.
- **Fixed: `<main>` had a `z-index`**, creating a stacking context that rendered open modals underneath the sticky header.
- **Accessibility** — skip link, `role="dialog"` + `aria-modal`, focus trap, focus restoration, `aria-pressed` on filters, `aria-live` result count, keyboard-operable cards, visible focus rings, and full `prefers-reduced-motion` support.
- **Deep links** — `#egg=<id>` opens an egg directly and the hash tracks the open sheet.
- **Dependencies** — removed `express`, `better-sqlite3`, `@google/genai`, `dotenv`, `react-confetti`, `react-use`, `clsx`, `tailwind-merge` and `autoprefixer`, none of which were used. Added the missing `@types/react` and `@types/react-dom`.
- **TypeScript is strict**, and the build splits the syntax highlighter into its own chunk.
- **SEO** — title, description, Open Graph and Twitter cards, an inline SVG favicon, a `noscript` fallback, and a pre-boot stage paint.

---

*The first console.log nobody was meant to see. The first cursor that misbehaved at 3am. The first colleague who typed the code and grinned.*

Made by **AJ**
