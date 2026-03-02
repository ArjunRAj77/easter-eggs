import eggsData from './eggs.json';

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

export const eggs: EasterEgg[] = eggsData as EasterEgg[];
