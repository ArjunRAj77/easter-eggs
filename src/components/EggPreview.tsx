import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion } from 'framer-motion';
import { EasterEgg } from '../data/eggs';
import { Gamepad2, Zap, RotateCw, Ghost, Terminal, Monitor } from 'lucide-react';

interface EggPreviewProps {
  egg: EasterEgg;
}

/**
 * Component to render interactive previews for specific easter eggs.
 * Uses a switch statement to determine which preview component to render based on egg.id.
 */
export const EggPreview: React.FC<EggPreviewProps> = ({ egg }) => {
  const { width, height } = useWindowSize();

  switch (egg.id) {
    case 'konami-code':
      return <KonamiPreview />;
    case 'confetti-spam':
      return <ConfettiPreview />;
    case 'barrel-roll':
      return <BarrelRollPreview />;
    case 'spin-hover':
      return <SpinHoverPreview />;
    case 'blink-tag':
      return <BlinkPreview />;
    case 'marquee-tag':
      return <MarqueePreview />;
    case 'pacman-loader':
      return <PacmanPreview />;
    case 'hacker-typer':
      return <HackerTyperPreview />;
    case 'dvd-screensaver':
      return <DVDPreview />;
    default:
      // Default fallback for eggs without a specific preview implementation
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Monitor size={32} className="opacity-50" />
          </div>
          <p className="text-lg font-medium text-slate-400">Preview not available</p>
          <p className="text-sm text-slate-600 mt-2 max-w-xs">
            This easter egg requires specific environment setup or external libraries that can't be previewed here.
          </p>
        </div>
      );
  }
};

/**
 * Preview component for the Konami Code easter egg.
 * Listens for the sequence: Up, Up, Down, Down, Left, Right, Left, Right, B, A.
 */
const KonamiPreview = () => {
  const [keys, setKeys] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys(prev => {
        const newKeys = [...prev, e.key].slice(-10);
        if (newKeys.join('') === konami.join('')) {
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
        return newKeys;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-6">
      <div className="text-slate-400 text-center">
        <p className="mb-2">Type the code:</p>
        <div className="flex gap-2 justify-center">
          {['↑', '↑', '↓', '↓', '←', '→', '←', '→', 'B', 'A'].map((k, i) => (
            <span key={i} className="font-mono font-bold text-slate-500">{k}</span>
          ))}
        </div>
      </div>
      
      <div className="flex gap-1 h-10 items-center">
        {keys.map((k, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-8 h-8 flex items-center justify-center rounded bg-white/10 text-xs font-mono text-slate-300 uppercase"
          >
            {k.replace('Arrow', '').substring(0, 2)}
          </motion.div>
        ))}
      </div>

      {success && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-emerald-400 font-bold text-xl flex items-center gap-2"
        >
          <Gamepad2 className="animate-bounce" /> CHEAT ACTIVATED!
        </motion.div>
      )}
    </div>
  );
};

/**
 * Preview component for Confetti Spam.
 * Triggers a confetti explosion on button click.
 */
const ConfettiPreview = () => {
  const [fire, setFire] = useState(false);
  const { width, height } = useWindowSize();
  
  return (
    <div className="flex flex-col items-center justify-center h-64 relative overflow-hidden rounded-xl">
      {fire && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <Confetti
            width={width} // Use window size but confined by overflow-hidden parent if positioned absolute? No, Confetti uses portal usually or fixed.
            // Actually react-confetti renders a canvas. If we don't use portal, it renders where it is.
            // But we want it to look like it's inside the preview area.
            // Let's try to contain it.
            numberOfPieces={200}
            recycle={false}
            onConfettiComplete={() => setFire(false)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </div>
      )}
      <button 
        onClick={() => setFire(true)}
        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all active:scale-95 flex items-center gap-2"
      >
        <Zap size={18} />
        Click Me!
      </button>
    </div>
  );
};

/**
 * Preview component for Barrel Roll.
 * Rotates the content 360 degrees when clicked.
 */
const BarrelRollPreview = () => {
  const [rolling, setRolling] = useState(false);
  
  return (
    <div className="flex flex-col items-center justify-center h-64 perspective-1000">
      <motion.div
        animate={rolling ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        onAnimationComplete={() => setRolling(false)}
        className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center"
      >
        <div className="mb-4 text-4xl">🦊</div>
        <button 
          onClick={() => setRolling(true)}
          disabled={rolling}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RotateCw size={18} />
          Do a Barrel Roll!
        </button>
      </motion.div>
    </div>
  );
};

/**
 * Preview component for Spinning Elements.
 * Elements spin when hovered over.
 */
const SpinHoverPreview = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-8">
      <p className="text-slate-400">Hover over the items:</p>
      <div className="flex gap-8">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl cursor-pointer hover:animate-spin transition-all"
          >
            {['🚀', '⭐', '🪐'][i-1]}
          </div>
        ))}
      </div>
      <style>{`
        .hover\\:animate-spin:hover {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

/**
 * Preview component for the Blink Tag.
 * Simulates the old <blink> tag using CSS animation.
 */
const BlinkPreview = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="text-4xl font-bold text-pink-500 animate-blink">
        WARNING: 90s DETECTED
      </div>
      <style>{`
        .animate-blink {
          animation: blinker 1s linear infinite;
        }
        @keyframes blinker {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

/**
 * Preview component for Marquee Madness.
 * Simulates the scrolling <marquee> tag using CSS animation.
 */
const MarqueePreview = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 w-full overflow-hidden">
      <div className="w-full bg-black border-y border-white/10 py-4 relative overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-2xl font-mono text-green-400">
          WELCOME TO THE INTERNET • UNDER CONSTRUCTION • SIGN MY GUESTBOOK • 
          WELCOME TO THE INTERNET • UNDER CONSTRUCTION • SIGN MY GUESTBOOK •
        </div>
      </div>
      <style>{`
        .animate-marquee {
          display: inline-block;
          animation: marquee 10s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

/**
 * Preview component for Pacman Loader.
 * CSS-only Pacman animation.
 */
const PacmanPreview = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-black">
      <div className="pacman"></div>
      <style>{`
        .pacman {
          width: 0px; height: 0px;
          border-right: 30px solid transparent;
          border-top: 30px solid #fbbf24;
          border-left: 30px solid #fbbf24;
          border-bottom: 30px solid #fbbf24;
          border-radius: 30px;
          animation: eat 0.5s infinite;
        }
        @keyframes eat {
          0% { border-right-width: 30px; }
          50% { border-right-width: 0px; }
          100% { border-right-width: 30px; }
        }
      `}</style>
    </div>
  );
};

/**
 * Preview component for Hacker Typer.
 * Types out code automatically when any key is pressed.
 */
const HackerTyperPreview = () => {
  const [text, setText] = useState('');
  const code = "const secret = 'algorithm';\nfunction hack() {\n  return 'access granted';\n}";
  const index = useRef(0);

  useEffect(() => {
    const handleKeyDown = () => {
      setText(prev => {
        const nextChar = code[index.current % code.length];
        index.current++;
        return prev + nextChar;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col h-64 w-full bg-black p-4 font-mono text-green-500 text-sm overflow-hidden">
      <div className="mb-2 text-slate-500 select-none">// Start typing randomly...</div>
      <pre className="whitespace-pre-wrap break-all">{text}<span className="animate-pulse">_</span></pre>
    </div>
  );
};

/**
 * Preview component for DVD Screensaver.
 * Simulates the bouncing DVD logo using CSS animation.
 */
const DVDPreview = () => {
  return (
    <div className="flex items-center justify-center h-64 w-full bg-black relative overflow-hidden">
      <div className="dvd-logo absolute text-white font-bold text-xl p-2 border-2 border-white rounded">
        DVD
      </div>
      <style>{`
        .dvd-logo {
          animation: bounce 5s linear infinite alternate;
        }
        @keyframes bounce {
          0% { top: 0; left: 0; color: red; border-color: red; }
          25% { top: 80%; left: 50%; color: blue; border-color: blue; }
          50% { top: 0; left: 80%; color: green; border-color: green; }
          75% { top: 80%; left: 20%; color: yellow; border-color: yellow; }
          100% { top: 0; left: 0; color: purple; border-color: purple; }
        }
      `}</style>
    </div>
  );
};
