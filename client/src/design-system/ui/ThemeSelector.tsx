'use client';

/**
 * design-system/ui/ThemeSelector.tsx
 * Three-theme switcher with live preview swatches.
 * Replaces: src/components/ui/theme-toggle.tsx
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppTheme } from '../theme-context';
import { RADII } from '../tokens';
import type { ThemeName } from '../tokens';
import { Palette, Check } from 'lucide-react';
import { useState } from 'react';

const SWATCH_COLORS: Record<ThemeName, [string, string]> = {
  dark:      ['#34d399', '#020409'],
  cyberpunk: ['#22d3ee', '#020010'],
  aurora:    ['#8b5cf6', '#f0f4ff'],
};

export function ThemeSelector() {
  const { themeName, setTheme, availableThemes } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(v => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-muted/60 transition-colors hover:border-primary/40 hover:bg-muted focus:outline-none"
        aria-label="Change theme"
      >
        <Palette className="h-4 w-4 text-muted-foreground" />
        {/* Active theme dot */}
        <span
          className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-background shadow"
          style={{ backgroundColor: SWATCH_COLORS[themeName][0] }}
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-xl border border-white/10 bg-black/90 p-1.5 shadow-2xl backdrop-blur-xl"
            >
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Theme
              </p>

              {availableThemes.map(t => {
                const [accent, bg] = SWATCH_COLORS[t.name];
                const isActive = t.name === themeName;

                return (
                  <button
                    key={t.name}
                    onClick={() => { setTheme(t.name); setOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm transition-all ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {/* Swatch */}
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-xs font-bold shadow-inner"
                      style={{ background: `linear-gradient(135deg, ${bg} 40%, ${accent})` }}
                    >
                      <span style={{ color: accent, textShadow: `0 0 8px ${accent}` }}>◈</span>
                    </span>

                    <span className="flex-1 font-medium">{t.label}</span>

                    {isActive && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

