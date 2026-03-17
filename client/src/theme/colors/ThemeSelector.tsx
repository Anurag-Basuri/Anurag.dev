'use client';

/**
 * design-system/ui/ThemeSelector.tsx
 * Four-theme switcher with live color swatches.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppTheme } from './theme-context';
import type { ThemeName } from './tokens';
import { Palette, Check, Sun, Moon, Eclipse } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const BRIGHTNESS_ICON: Record<string, React.FC<{ className?: string }>> = {
  dark: Moon,
  light: Sun,
  medium: Eclipse,
};

export function ThemeSelector() {
  const { themeName, setTheme, availableThemes, isDark } = useAppTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(v => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-md transition-colors hover:bg-white/10 focus:outline-none"
        aria-label="Change theme"
      >
        <Palette className="h-4 w-4 text-(--theme-primary)" />
      </motion.button>

      <AnimatePresence>
        {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border border-white/10 bg-black/90 p-2 shadow-2xl backdrop-blur-2xl"
            >
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                Theme
              </p>

              {availableThemes.map(t => {
                const isActive = t.name === themeName;
                const BrightnessIcon = BRIGHTNESS_ICON[t.brightness] ?? Moon;

                return (
                  <button
                    key={t.name}
                    onClick={() => { setTheme(t.name); setOpen(false); }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {/* Color swatch */}
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-inner"
                      style={{
                        background: `linear-gradient(135deg, ${t.bg} 40%, ${t.primary})`,
                        border: `1px solid ${t.primary}30`,
                      }}
                    >
                      <BrightnessIcon className="h-3 w-3" style={{ color: t.primary }} />
                    </span>

                    <span className="flex-1 font-medium">{t.label}</span>

                    {isActive && <Check className="h-3.5 w-3.5" style={{ color: t.primary }} />}
                  </button>
                );
              })}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
