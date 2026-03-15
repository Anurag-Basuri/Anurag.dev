'use client';

/**
 * design-system/theme-context.tsx
 * Centralized theme state: React Context + Jotai atom + next-themes integration.
 */

import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { atom, useAtom } from 'jotai';
import { THEMES, DEFAULT_THEME, type ThemeName, type ThemePalette } from './tokens';

// ─── Atoms ─────────────────────────────────────────────────────────────────────
export const themeNameAtom = atom<ThemeName>(DEFAULT_THEME);

// ─── Context ───────────────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme: ThemePalette;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  availableThemes: ThemePalette[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────
export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeAtom] = useAtom(themeNameAtom);
  const { setTheme: setNextTheme } = useNextTheme();

  const theme = THEMES[themeName];

  const setTheme = (name: ThemeName) => {
    setThemeAtom(name);
    // Sync CSS classes with next-themes
    setNextTheme(THEMES[name].htmlClass);
  };

  // Apply CSS custom properties on theme change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary-hex', theme.primaryHex);
    root.style.setProperty('--theme-secondary-hex', theme.secondaryHex);
    root.dataset.theme = themeName;
  }, [theme, themeName]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeName,
        setTheme,
        availableThemes: Object.values(THEMES),
      }}
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

/** Read-only theme name atom hook (no re-render on unrelated state) */
export function useThemeName(): ThemeName {
  const [name] = useAtom(themeNameAtom);
  return name;
}

