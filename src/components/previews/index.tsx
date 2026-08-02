import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Stage, TriggerButton, EffectStage, FauxTerminal, FauxConsole, NoPreview } from './primitives';
import {
  KonamiPreview, ConfettiPreview, DVDPreview, StarfieldPreview, MatrixPreview, FirePreview,
  PacmanPreview, HackerTyperPreview, TRexPreview, PongPreview, ZergPreview, ThanosPreview,
  LightsaberPreview, OnekoPreview, XeyesPreview, ContextMenuPreview, NyanPreview, BSODPreview,
  FakeUpdatePreview, SelfDestructPreview, ClippyPreview, GravityPreview, PartyPreview,
  CRTPreview, PixelatePreview, SLPreview, FaviconPreview, ShakePreview, SoundPreview,
  DarkModePreview, RickrollPreview,
} from './interactive';

/* ═══════════════════════════════════════════════════════════════════════════
   THE PREVIEW REGISTRY
   ───────────────────────────────────────────────────────────────────────────
   Before this rebuild, 9 of 60 eggs had a preview and the other 51 rendered
   "Preview not available" — which is the worst possible thing for a gallery
   whose entire pitch is "see it before you paste it".

   Every entry below is a live, running demo. Terminal output arrays live at
   module scope on purpose: FauxTerminal keys its typing effect off the array
   identity, so an inline literal would restart the animation on every render.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Terminal transcripts ────────────────────────────────────────────── */

const OUT_SECRET = [
  '',
  '  You found the secret. Well done.',
  '',
  '  Achievement unlocked: RTFM',
  '',
];

const OUT_SUDO = [
  'What? Make it yourself.',
  '',
  '$ sudo make me a sandwich',
  'Okay.',
];

const OUT_COWSAY = [
  ' _________________________________ ',
  '< Have you tried turning it off? >',
  ' --------------------------------- ',
  '        \\   ^__^',
  '         \\  (oo)\\_______',
  '            (__)\\       )\\/\\',
  '                ||----w |',
  '                ||     ||',
];

const OUT_FORTUNE = [
  '',
  'Any sufficiently advanced bug is',
  'indistinguishable from a feature.',
  '',
  '                -- Rich Kulawiec',
];

const OUT_TOILET = [
  ' _   _ _____ _     _     ___  ',
  '| | | | ____| |   | |   / _ \\ ',
  '| |_| |  _| | |   | |  | | | |',
  '|  _  | |___| |___| |__| |_| |',
  '|_| |_|_____|_____|_____\\___/ ',
];

const OUT_TEAPOT = [
  'HTTP/1.1 418 I\'m a teapot',
  'Content-Type: text/plain',
  'X-Brew-Time: 3m',
  '',
  'The requested entity body is short and stout.',
  'Tip me over and pour me out.',
  '',
  '        (',
  '     (   )  )',
  '      ) ( )',
  '    _____(__',
  '   [_________]___',
  '    \\_______/',
];

const OUT_STARWARS = [
  '',
  '        A long time ago in a',
  '     terminal far, far away....',
  '',
  '            *       .        *',
  '        .        .       *',
  '     *      .-""""-.        .',
  '           /  o  o  \\    *',
  '          |    <>    |',
  '     .     \\  \\__/  /       *',
  '            \'-....-\'',
  '',
  '   Episode IV — A NEW HOPE',
];

const OUT_ASCII_VIDEO = [
  '  ....,,;;;;;;;;,,....  ',
  ' .,;%%%%%%%%%%%%%%%%;,. ',
  ',;%%%%##@@@@@@@@##%%%%;,',
  ';%%%##@@@@@@@@@@@@##%%%;',
  ';%%##@@@@@######@@@@##%%;',
  ';%%##@@@##      ##@@##%%;',
  ' ;%%##@@@##    ##@@##%%; ',
  '  ;%%%##@@@####@@@##%%%; ',
  '   \',;%%%%######%%%%;,\'  ',
  '      \'\',,;;;;;;,,\'\'     ',
  '',
  '  frame 47/2400 · 24 fps · ffmpeg → ascii',
];

/* ── Console transcripts ─────────────────────────────────────────────── */

const CONSOLE_ART = [
  { text: '   ___  ___  __  __ ', style: { color: '#ffd23f' } },
  { text: '  / _ \\/ _ \\/ / / / ', style: { color: '#ffd23f' } },
  { text: ' / , _/ , _/ /_/ /  ', style: { color: '#ffe27a' } },
  { text: '/_/|_/_/|_|\\____/   ', style: { color: '#fff3c2' } },
  { text: '' },
  { text: "We're hiring! → jobs@example.com", style: { color: '#7cff4f', fontWeight: 600 } },
  { text: 'Also: stop reading the console and go outside.', style: { color: '#877fad' } },
];

const CONSOLE_RAINBOW = [
  { text: 'R — the quick brown fox', style: { color: '#ff6b6b' } },
  { text: 'A — jumps over the lazy', style: { color: '#ffd23f' } },
  { text: 'I — dog and then keeps', style: { color: '#ffe27a' } },
  { text: 'N — going because it is', style: { color: '#7cff4f' } },
  { text: 'B — a very determined', style: { color: '#00e5ff' } },
  { text: 'O — fox with somewhere', style: { color: '#b06cff' } },
  { text: 'W — important to be.', style: { color: '#ff2d95' } },
  { text: '' },
  { text: '%c ← all of that is one console.log with CSS', style: { color: '#877fad', fontStyle: 'italic' } },
];

const CONSOLE_RECURSION = [
  { text: '> recursion', style: { color: '#bbb5d9' } },
  { text: 'Did you mean: recursion', style: { color: '#00e5ff' } },
  { text: '> recursion', style: { color: '#bbb5d9' } },
  { text: 'Did you mean: recursion', style: { color: '#00e5ff' } },
  { text: '> recursion', style: { color: '#bbb5d9' } },
  { text: 'Did you mean: recursion', style: { color: '#00e5ff' } },
  { text: 'RangeError: Maximum call stack size exceeded', style: { color: '#ff6b6b' } },
];

/* ── A few small locals ──────────────────────────────────────────────── */

const BlinkPreview: React.FC = () => (
  <Stage live hint="Deprecated in 2013. Mourned by nobody. Missed by everybody.">
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.p
        className="font-mono text-[19px] font-bold"
        style={{ color: 'var(--cyan)' }}
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: 'linear' }}
      >
        &lt;blink&gt;UNDER CONSTRUCTION&lt;/blink&gt;
      </motion.p>
    </div>
  </Stage>
);

const MarqueePreview: React.FC = () => (
  <Stage live hint="Netscape Navigator 2.0, and we have never recovered">
    <div className="absolute inset-0 flex flex-col justify-center gap-4 overflow-hidden">
      {[
        { text: '★ WELCOME TO MY HOMEPAGE ★ BEST VIEWED IN 800×600 ★ ', dur: 11, color: 'var(--cyan)' },
        { text: '◆ SIGN MY GUESTBOOK ◆ 1,337 VISITORS SINCE 1998 ◆ ', dur: 15, color: '#7cff4f' },
        { text: '✉ EMAIL ME ✉ POWERED BY GEOCITIES ✉ ', dur: 8, color: '#ff2d95' },
      ].map((row) => (
        <div key={row.text} className="relative w-full overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap font-mono text-[12px] font-bold"
            style={{ color: row.color }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: row.dur, repeat: Infinity, ease: 'linear' }}
          >
            <span>{row.text.repeat(4)}</span>
            <span>{row.text.repeat(4)}</span>
          </motion.div>
        </div>
      ))}
    </div>
  </Stage>
);

const Answer42Preview: React.FC = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (phase !== 1) return;
    const id = window.setTimeout(() => setPhase(2), 2600);
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <Stage live={phase > 0} hint="Deep Thought took 7.5 million years. This takes 2.6 seconds.">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
        {phase === 0 && (
          <TriggerButton onClick={() => setPhase(1)} label="Ask the ultimate question" />
        )}
        {phase === 1 && (
          <>
            <motion.span
              className="text-[30px]"
              animate={{ rotate: 360 }}
              transition={{ duration: 2.4, ease: 'linear', repeat: Infinity }}
            >
              🌌
            </motion.span>
            <p className="text-[12px] font-mono" style={{ color: 'var(--text-400)' }}>
              Computing…
            </p>
          </>
        )}
        {phase === 2 && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 15 }}
          >
            <p className="font-display text-[68px] leading-none rgb-split" style={{ color: '#fff', textShadow: '0 0 6px #fff, 0 0 22px var(--cyan), 0 0 48px var(--cyan)' }}>42</p>
            <p className="mt-3 text-[11.5px]" style={{ color: 'var(--text-400)' }}>
              Life, the Universe, and Everything
            </p>
            <button onClick={() => setPhase(0)} className="mt-4 text-[11px] font-mono underline" style={{ color: 'var(--text-500)' }}>
              ask again
            </button>
          </motion.div>
        )}
      </div>
    </Stage>
  );
};

const AntiGravityPreview: React.FC = () => {
  const [flying, setFlying] = useState(false);

  return (
    <Stage live={flying} hint="xkcd 353. Everybody stand back — I know Python.">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <motion.span
          className="text-[42px] select-none"
          animate={
            flying
              ? { y: [0, -46, -30, -58, -40], x: [0, 22, -18, 26, 0], rotate: [0, 12, -9, 14, 0] }
              : { y: 0, x: 0, rotate: 0 }
          }
          transition={flying ? { duration: 4.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.6 }}
        >
          🧙
        </motion.span>
        <TriggerButton onClick={() => setFlying((v) => !v)} label={flying ? 'Land' : 'import antigravity'} />
      </div>
    </Stage>
  );
};

const NyanScrollPreview: React.FC = () => {
  const [p, setP] = useState(0.18);

  return (
    <Stage live hint="Drag the bar — the cat is your scroll progress indicator">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 px-8">
        <div className="relative w-full h-8">
          <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div
            className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full"
            style={{
              width: `${p * 100}%`,
              background: 'linear-gradient(90deg, #ff6b6b, #ffd23f, #ffe27a, #7cff4f, #00e5ff, #b06cff)',
            }}
          />
          <span
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-[21px] pointer-events-none select-none"
            style={{ left: `${p * 100}%` }}
          >
            🐱
          </span>
          <input
            type="range" min={0} max={100} value={p * 100}
            onChange={(e) => setP(Number(e.target.value) / 100)}
            aria-label="Scroll progress"
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
        <p className="text-[11px] font-mono" style={{ color: 'var(--text-500)' }}>
          {Math.round(p * 100)}% down the page
        </p>
      </div>
    </Stage>
  );
};

const HarlemShakePreview: React.FC = () => {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    if (phase !== 1) return;
    const id = window.setTimeout(() => setPhase(2), 2400);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== 2) return;
    const id = window.setTimeout(() => setPhase(0), 5000);
    return () => window.clearTimeout(id);
  }, [phase]);

  const items = ['🟨', '🟧', '🟩', '🟦', '🟪', '🟥'];

  return (
    <Stage live={phase > 0} hint={phase === 1 ? 'One element moves. Nobody reacts.' : 'And then everything loses its mind.'}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        <div className="flex gap-3">
          {items.map((it, i) => (
            <motion.span
              key={it}
              className="text-[24px] select-none"
              animate={
                phase === 2
                  ? { y: [0, -14, 0], rotate: [0, 20, -20, 0], scale: [1, 1.25, 1] }
                  : phase === 1 && i === 2
                  ? { y: [0, -9, 0], rotate: [0, 9, -9, 0] }
                  : {}
              }
              transition={{
                duration: phase === 2 ? 0.32 : 0.5,
                repeat: Infinity,
                delay: phase === 2 ? i * 0.04 : 0,
              }}
            >
              {it}
            </motion.span>
          ))}
        </div>
        {phase === 0 && <TriggerButton onClick={() => setPhase(1)} label="Do the Harlem Shake" />}
      </div>
    </Stage>
  );
};

/* ═══ The map ═════════════════════════════════════════════════════════════ */

export const previewRegistry: Record<string, () => React.ReactElement> = {
  /* Web — interaction */
  'konami-code': () => <KonamiPreview />,
  'confetti-spam': () => <ConfettiPreview />,
  'dark-mode-toggle': () => <DarkModePreview />,
  'shake-surprise': () => <ShakePreview />,
  'rickroll-redirect': () => <RickrollPreview />,
  'custom-context': () => <ContextMenuPreview />,
  'lightsaber-cursor': () => <LightsaberPreview />,
  'zerg-rush': () => <ZergPreview />,
  'thanos-snap': () => <ThanosPreview />,
  'self-destruct': () => <SelfDestructPreview />,
  'fake-update': () => <FakeUpdatePreview />,
  'bsod-fake': () => <BSODPreview />,
  'clippy-js': () => <ClippyPreview />,
  'gravity-fall': () => <GravityPreview />,
  'anti-gravity': () => <AntiGravityPreview />,
  'party-mode': () => <PartyPreview />,
  'harlem-shake': () => <HarlemShakePreview />,
  'answer-42': () => <Answer42Preview />,
  'hacker-typer': () => <HackerTyperPreview />,
  'geek-typer': () => <HackerTyperPreview />,

  /* Web — canvas & motion */
  'dvd-screensaver': () => <DVDPreview />,
  'starfield-bg': () => <StarfieldPreview />,
  'nyan-cat-fly': () => <NyanPreview />,
  'nyan-scroll': () => <NyanScrollPreview />,
  'pacman-loader': () => <PacmanPreview />,
  'pixelate-canvas': () => <PixelatePreview />,
  'crt-monitor': () => <CRTPreview />,
  'trex-runner': () => <TRexPreview />,
  'pong-title': () => <PongPreview />,
  'favicon-anim': () => <FaviconPreview />,
  'blink-tag': () => <BlinkPreview />,
  'marquee-tag': () => <MarqueePreview />,

  /* Web — CSS transforms & filters */
  'barrel-roll': () => (
    <EffectStage
      label="Do a barrel roll"
      css={{ transform: 'rotate(360deg)' }}
      duration={1400}
      transition="transform 1.35s cubic-bezier(0.5, 0, 0.5, 1)"
      hint="google.com, 2011. Two lines of CSS."
    />
  ),
  'spin-hover': () => (
    <EffectStage
      label="Spin"
      css={{ transform: 'rotate(360deg) scale(1.06)' }}
      duration={1100}
      transition="transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)"
      hint="Bind it to :hover and watch nobody get any work done"
    />
  ),
  'upside-down': () => (
    <EffectStage label="Flip the world" css={{ transform: 'rotate(180deg)' }} hint="Australia mode" />
  ),
  'mirror-mode': () => (
    <EffectStage label="Mirror" css={{ transform: 'scaleX(-1)' }} hint="scaleX(-1) on <html>. Cruel and effective." />
  ),
  'askew-tilt': () => (
    <EffectStage
      label="Askew"
      css={{ transform: 'rotate(-1.6deg) skewY(-1.4deg)' }}
      hint="Just enough to make you tilt your head, not enough to be sure"
    />
  ),
  'invert-colors': () => (
    <EffectStage label="Invert" css={{ filter: 'invert(1) hue-rotate(180deg)' }} hint="filter: invert(1) — the two-second dark mode" />
  ),
  'blur-page': () => (
    <EffectStage label="Lose your glasses" css={{ filter: 'blur(4.5px)' }} hint="−2.5 dioptres, approximately" />
  ),
  'comic-sans': () => (
    <EffectStage
      label="Comic Sans everything"
      css={{ fontFamily: '"Comic Sans MS", "Comic Sans", cursive' }}
      sceneClassName="[&_*]:!font-[Comic_Sans_MS,cursive]"
      hint="A war crime, technically"
    />
  ),
  'vaporwave-filter': () => (
    <EffectStage
      label="A E S T H E T I C"
      css={{
        filter: 'hue-rotate(285deg) saturate(1.9) contrast(1.15)',
        textShadow: '2px 0 rgba(255,0,120,0.6), -2px 0 rgba(0,220,255,0.6)',
      }}
      hint="Hue rotation plus a 2px chromatic split. 1984 never happened."
    />
  ),

  /* Audio */
  'sound-8bit': () => <SoundPreview kind="8bit" />,
  'wilhelm-scream': () => <SoundPreview kind="wilhelm" />,
  'elevator-music': () => <SoundPreview kind="elevator" />,

  /* Console */
  'console-art': () => <FauxConsole entries={CONSOLE_ART} />,
  'console-rainbow': () => <FauxConsole entries={CONSOLE_RAINBOW} />,
  'recursion-link': () => <FauxConsole entries={CONSOLE_RECURSION} header="Recursion" />,

  /* CLI */
  'terminal-secret': () => <FauxTerminal command="./configure --enable-secrets" output={OUT_SECRET} />,
  'sudo-sandwich': () => <FauxTerminal command="make me a sandwich" output={OUT_SUDO} color="#ffd23f" />,
  'cowsay-moo': () => <FauxTerminal command='cowsay "Have you tried turning it off?"' output={OUT_COWSAY} />,
  'fortune-cookie-cli': () => <FauxTerminal command="fortune" output={OUT_FORTUNE} color="#ffe27a" />,
  'toilet-text': () => <FauxTerminal command="toilet -f mono12 --gay HELLO" output={OUT_TOILET} color="#ff2d95" />,
  'teapot-418': () => <FauxTerminal command="curl -i https://api.example.com/coffee" output={OUT_TEAPOT} color="#00e5ff" />,
  'ascii-starwars': () => <FauxTerminal command="telnet towel.blinkenlights.nl" output={OUT_STARWARS} color="#ffe27a" />,
  'ascii-video': () => <FauxTerminal command="mpv --vo=tct video.mp4" output={OUT_ASCII_VIDEO} color="#bbb5d9" loop />,
  'sl-train': () => <SLPreview />,
  'cmatrix-rain': () => <MatrixPreview />,
  'aafire-burn': () => <FirePreview />,

  /* Desktop */
  'oneko-cat': () => <OnekoPreview />,
  'xeyes-watch': () => <XeyesPreview />,
};

export const hasPreview = (id: string) => id in previewRegistry;

export const renderPreview = (id: string): React.ReactElement => {
  const make = previewRegistry[id];
  return make ? make() : <NoPreview />;
};
