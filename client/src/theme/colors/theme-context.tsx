'use client';

/**
 * design-system/theme-context.tsx
 * Centralized theme state for all themes.
 * Bridges Jotai atom + CSS custom properties.
 * This is the SOLE driver of all CSS variables — no separate light/dark CSS blocks.
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

  // Apply ALL CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const s = root.style;

    // ── Theme accent identifiers (used by components for theme-specific styling) ──
    s.setProperty('--theme-primary', theme.primary);
    s.setProperty('--theme-secondary', theme.secondary);
    s.setProperty('--theme-bg', theme.bg);
    s.setProperty('--theme-fg', theme.fg);
    s.setProperty('--theme-muted', theme.mutedFg);

    // ── Core semantic tokens (drive all Tailwind utilities like text-foreground, bg-card, etc.) ──
    s.setProperty('--background', theme.bg);
    s.setProperty('--foreground', theme.fg);
    s.setProperty('--card', theme.card);
    s.setProperty('--card-foreground', theme.cardFg);
    s.setProperty('--popover', theme.popover);
    s.setProperty('--popover-foreground', theme.popoverFg);
    s.setProperty('--primary', theme.primary);
    s.setProperty('--primary-foreground', isDark ? '#000000' : '#ffffff');
    s.setProperty('--secondary', theme.secondary_surface);
    s.setProperty('--secondary-foreground', theme.secondaryFg);
    s.setProperty('--muted', theme.muted);
    s.setProperty('--muted-foreground', theme.mutedFg);
    s.setProperty('--accent', theme.accent);
    s.setProperty('--accent-foreground', theme.accentFg);
    s.setProperty('--border', theme.border);
    s.setProperty('--input', theme.input);
    s.setProperty('--ring', theme.ring);

    // ── Sidebar ──
    s.setProperty('--sidebar', theme.sidebar);
    s.setProperty('--sidebar-foreground', theme.sidebarFg);
    s.setProperty('--sidebar-primary', theme.primary);
    s.setProperty('--sidebar-primary-foreground', isDark ? '#000000' : '#ffffff');
    s.setProperty('--sidebar-accent', theme.sidebarAccent);
    s.setProperty('--sidebar-accent-foreground', theme.sidebarAccentFg);
    s.setProperty('--sidebar-border', theme.sidebarBorder);
    s.setProperty('--sidebar-ring', theme.ring);

    // ── Shadows ──
    s.setProperty('--shadow-sm', theme.shadowSm);
    s.setProperty('--shadow-md', theme.shadowMd);
    s.setProperty('--shadow-lg', theme.shadowLg);
    s.setProperty('--shadow-xl', theme.shadowXl);
    s.setProperty('--shadow-premium', theme.shadowPremium);

    // ── Data attributes & class toggles ──
    root.dataset.theme = themeName;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';

    // ── Body fallback styling ──
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
