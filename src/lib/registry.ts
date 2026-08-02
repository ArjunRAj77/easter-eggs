import {
  AlertTriangle, ArrowDown, Battery, Bell, Book, Bug, Calendar, Camera, Car, Check,
  Clock, Cloud, Code, Coffee, Cpu, Database, Download, Egg, EyeOff, File, Film,
  Folder, Gamepad2, Ghost, Globe, Grid, Hammer, Heart, HelpCircle, Home, Image,
  Info, Key, Link, Lock, LucideIcon, Map, MessageCircle, Mic, Monitor, Moon, Music,
  Palette, Power, Rocket, RotateCw, Save, Search, Server, Settings, Share, Shield,
  Skull, Smartphone, Smile, Speaker, Star, Sun, Terminal, Trash, User, Wifi, Wrench,
  Zap,
} from 'lucide-react';
import type { Category, Difficulty } from '../data/eggs';

/**
 * Single source of truth for the icon set. This map used to be duplicated
 * verbatim in EggCard and EggDetail, which meant an icon added to one silently
 * fell back to <Smile/> in the other.
 */
export const iconMap: Record<string, LucideIcon> = {
  AlertTriangle, ArrowDown, Battery, Bell, Book, Bug, Calendar, Camera, Car, Check,
  Clock, Cloud, Code, Coffee, Cpu, Database, Download, Egg, EyeOff, File, Film,
  Folder, Gamepad2, Ghost, Globe, Grid, Hammer, Heart, HelpCircle, Home, Image,
  Info, Key, Link, Lock, Map, MessageCircle, Mic, Monitor, Moon, Music, Palette,
  Power, Rocket, RotateCw, Save, Search, Server, Settings, Share, Shield, Skull,
  Smartphone, Smile, Speaker, Star, Sun, Terminal, Trash, User, Wifi, Wrench, Zap,
};

export const resolveIcon = (name: string): LucideIcon => iconMap[name] ?? Egg;

/**
 * Category tubes. Six gases, one per category — fully saturated, because on
 * an emissive surface a desaturated colour just reads as a dead pixel.
 *
 * `tint` is the tube, `wash` its spill onto the cabinet behind it, `edge` the
 * glass itself.
 */
export const categoryLight: Record<Category, { tint: string; wash: string; edge: string }> = {
  Web:     { tint: '#00e5ff', wash: 'rgba(0, 229, 255, 0.10)',   edge: 'rgba(0, 229, 255, 0.40)' },
  Mobile:  { tint: '#b06cff', wash: 'rgba(176, 108, 255, 0.10)', edge: 'rgba(176, 108, 255, 0.40)' },
  Game:    { tint: '#7cff4f', wash: 'rgba(124, 255, 79, 0.10)',  edge: 'rgba(124, 255, 79, 0.40)' },
  CLI:     { tint: '#ffd23f', wash: 'rgba(255, 210, 63, 0.10)',  edge: 'rgba(255, 210, 63, 0.40)' },
  Desktop: { tint: '#ff2d95', wash: 'rgba(255, 45, 149, 0.10)',  edge: 'rgba(255, 45, 149, 0.40)' },
};

/** Difficulty, read as a threat level on the cabinet marquee. */
export const difficultyLight: Record<Difficulty, { tint: string; label: string }> = {
  Easy:    { tint: '#7cff4f', label: 'Easy' },
  Medium:  { tint: '#ffd23f', label: 'Medium' },
  Chaotic: { tint: '#ff2d95', label: 'Chaotic' },
};

export const CATEGORIES: Category[] = ['Web', 'Mobile', 'Game', 'CLI', 'Desktop'];
export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Chaotic'];

/** Where "Submit an egg" and every repo link point. */
export const REPO_URL = 'https://github.com/ArjunRAj77/easter-eggs';
