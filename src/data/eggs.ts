import { LucideIcon, Gamepad2, Terminal, Smartphone, Globe, Monitor, Zap, Ghost, Skull, Smile } from 'lucide-react';

export type Difficulty = 'Easy' | 'Medium' | 'Chaotic';
export type Category = 'Web' | 'Mobile' | 'Game' | 'CLI' | 'Desktop';

export interface CodeSnippet {
  language: string;
  code: string;
  label: string;
}

export interface EasterEgg {
  id: string;
  title: string;
  description: string;
  category: Category;
  difficulty: Difficulty;
  tags: string[];
  snippets: CodeSnippet[];
  previewType: 'icon' | 'interactive';
  iconName: string; // We'll map this to Lucide icons in the component
}

export const eggs: EasterEgg[] = [
  {
    id: 'konami-code',
    title: 'Konami Code',
    description: 'The classic cheat code sequence: Up, Up, Down, Down, Left, Right, Left, Right, B, A.',
    category: 'Web',
    difficulty: 'Easy',
    tags: ['classic', 'keyboard', 'cheat'],
    previewType: 'icon',
    iconName: 'Gamepad2',
    snippets: [
      {
        label: 'React Hook',
        language: 'typescript',
        code: `import { useEffect, useState } from 'react';

export const useKonamiCode = (callback: () => void) => {
  const [input, setInput] = useState<string[]>([]);
  const sequence = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight', 
    'b', 'a'
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newInput = [...input, e.key];
      if (newInput.length > sequence.length) {
        newInput.shift();
      }
      setInput(newInput);

      if (newInput.join('') === sequence.join('')) {
        callback();
        setInput([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, callback]);
};`
      },
      {
        label: 'Vanilla JS',
        language: 'javascript',
        code: `const konamiCode = [
  'ArrowUp', 'ArrowUp', 
  'ArrowDown', 'ArrowDown', 
  'ArrowLeft', 'ArrowRight', 
  'ArrowLeft', 'ArrowRight', 
  'b', 'a'
];
let konamiPosition = 0;

document.addEventListener('keydown', function(e) {
  const requiredKey = konamiCode[konamiPosition];
  if (e.key === requiredKey) {
    konamiPosition++;
    if (konamiPosition === konamiCode.length) {
      activateCheats();
      konamiPosition = 0;
    }
  } else {
    konamiPosition = 0;
  }
});

function activateCheats() {
  alert("Cheats activated!");
}`
      }
    ]
  },
  {
    id: 'confetti-spam',
    title: 'Confetti Spam',
    description: 'Unleash a burst of confetti when a user clicks a button repeatedly.',
    category: 'Web',
    difficulty: 'Medium',
    tags: ['visual', 'celebration', 'clicks'],
    previewType: 'icon',
    iconName: 'Zap',
    snippets: [
      {
        label: 'React + canvas-confetti',
        language: 'typescript',
        code: `import confetti from 'canvas-confetti';

const handleConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

// Usage: <button onClick={handleConfetti}>Celebrate!</button>`
      }
    ]
  },
  {
    id: 'dark-mode-toggle',
    title: 'Hidden Dark Mode',
    description: 'Toggle dark mode by clicking an element 5 times rapidly.',
    category: 'Web',
    difficulty: 'Easy',
    tags: ['theme', 'hidden', 'ui'],
    previewType: 'icon',
    iconName: 'Ghost',
    snippets: [
      {
        label: 'React',
        language: 'typescript',
        code: `import { useState } from 'react';

export const HiddenDarkMode = () => {
  const [clicks, setClicks] = useState(0);

  const handleClick = () => {
    setClicks(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        document.documentElement.classList.toggle('dark');
        return 0;
      }
      return newCount;
    });
  };

  return (
    <div onClick={handleClick} className="cursor-default select-none">
      Secret Area
    </div>
  );
};`
      }
    ]
  },
  {
    id: 'shake-surprise',
    title: 'Shake to Surprise',
    description: 'Detect device shake on mobile to trigger a hidden modal.',
    category: 'Mobile',
    difficulty: 'Medium',
    tags: ['mobile', 'accelerometer', 'interaction'],
    previewType: 'icon',
    iconName: 'Smartphone',
    snippets: [
      {
        label: 'React Native',
        language: 'typescript',
        code: `import { useEffect, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

export const useShake = (onShake: () => void) => {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const _subscribe = () => {
      setSubscription(
        Accelerometer.addListener(accelerometerData => {
          setData(accelerometerData);
        })
      );
    };

    const _unsubscribe = () => {
      subscription && subscription.remove();
      setSubscription(null);
    };

    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    const { x, y, z } = data;
    const totalForce = Math.abs(x) + Math.abs(y) + Math.abs(z);
    if (totalForce > 1.78) { // Threshold for shake
      onShake();
    }
  }, [data, onShake]);
};`
      }
    ]
  },
  {
    id: 'terminal-secret',
    title: 'Terminal Secret',
    description: 'A hidden command in your CLI tool that prints ASCII art.',
    category: 'CLI',
    difficulty: 'Easy',
    tags: ['cli', 'ascii', 'hidden'],
    previewType: 'icon',
    iconName: 'Terminal',
    snippets: [
      {
        label: 'Node.js',
        language: 'javascript',
        code: `const args = process.argv.slice(2);

if (args[0] === 'secret') {
  console.log(\`
   _    _      _ _       
  | |  | |    | | |      
  | |__| | ___| | | ___  
  |  __  |/ _ \\ | |/ _ \\ 
  | |  | |  __/ | | (_) |
  |_|  |_|\\___|_|_|\\___/ 
  \`);
  process.exit(0);
}`
      },
      {
        label: 'Python',
        language: 'python',
        code: `import sys

if len(sys.argv) > 1 and sys.argv[1] == "secret":
    print("""
   _    _      _ _       
  | |  | |    | | |      
  | |__| | ___| | | ___  
  |  __  |/ _ \\ | |/ _ \\ 
  | |  | |  __/ | | (_) |
  |_|  |_|\\___|_|_|\\___/ 
    """)
    sys.exit()`
      }
    ]
  },
  {
    id: 'rickroll-redirect',
    title: 'Rickroll Redirect',
    description: 'Redirect users to "Never Gonna Give You Up" when they try to access a forbidden path.',
    category: 'Web',
    difficulty: 'Chaotic',
    tags: ['prank', 'redirect', 'classic'],
    previewType: 'icon',
    iconName: 'Skull',
    snippets: [
      {
        label: 'React Router',
        language: 'typescript',
        code: `import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const ForbiddenPage = () => {
  useEffect(() => {
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }, []);

  return null;
};`
      }
    ]
  },
  {
    id: 'console-art',
    title: 'Console Art',
    description: 'Display a custom message or art in the browser developer console.',
    category: 'Web',
    difficulty: 'Easy',
    tags: ['console', 'branding', 'hiring'],
    previewType: 'icon',
    iconName: 'Monitor',
    snippets: [
      {
        label: 'JavaScript',
        language: 'javascript',
        code: `console.log(
  '%c Stop! ',
  'color: red; font-size: 30px; font-weight: bold; text-shadow: 2px 2px black;'
);
console.log(
  '%c This is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or "hack" someone\\'s account, it is a scam.',
  'font-size: 16px;'
);`
      }
    ]
  }
];
