'use client';

/**
 * design-system/theme-context.tsx
 * Centralized theme state for 4 themes.
 * Bridges Jotai atom + CSS custom properties.
 */

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { atom, useAtom } from 'jotai';
import { THEMES, DEFAULT_THEME, THEME_LIST, type ThemeName, type ThemePalette } from './tokens';

// ─── Atoms ─────────────────────────────────────────────────────────────────────
export const themeNameAtom = atom<ThemeName>(DEFAULT_THEME);

// ─── Context ───────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme: ThemePalette;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  isDark: boolean;
  availableThemes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useAtom(themeNameAtom);
  const theme = THEMES[themeName];
  const isDark = theme.brightness === 'dark' || theme.brightness === 'medium';

  const setTheme = (name: ThemeName) => {
    setThemeName(name);
  };

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-bg', theme.bg);
    root.style.setProperty('--theme-fg', theme.fg);
    root.style.setProperty('--theme-muted', theme.muted);
    root.dataset.theme = themeName;

    // Toggle .dark class to activate CSS variable definitions in globals.css
    root.classList.toggle('dark', isDark);

    // Set color-scheme for browser chrome
    root.style.colorScheme = isDark ? 'dark' : 'light';

    // Set body background
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.fg;
  }, [theme, themeName, isDark]);

  return (
    <ThemeContext.Provider
      value={{ theme, themeName, setTheme, isDark, availableThemes: THEME_LIST }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────
export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeContextProvider');
  return ctx;
}

export function useThemeName(): ThemeName {
  const [name] = useAtom(themeNameAtom);
  return name;
}
