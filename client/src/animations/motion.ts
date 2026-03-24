/**
 * design-system/motion.ts
 * Centralized Framer Motion variants, transitions, and spring configs.
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Easing Curves ─────────────────────────────────────────────────────────────
export const EASE = {
  smooth:    [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  out:       [0.0, 0.0, 0.2, 1.0]     as [number, number, number, number],
  in:        [0.4, 0.0, 1.0, 1.0]     as [number, number, number, number],
  inOut:     [0.4, 0.0, 0.2, 1.0]     as [number, number, number, number],
  bouncy:    [0.34, 1.56, 0.64, 1.0]  as [number, number, number, number],
} as const;

// ─── Spring Presets ────────────────────────────────────────────────────────────
export const SPRINGS = {
  gentle:  { type: 'spring', stiffness: 200, damping: 25 } as const,
  normal:  { type: 'spring', stiffness: 300, damping: 30 } as const,
  snappy:  { type: 'spring', stiffness: 400, damping: 20 } as const,
  bouncy:  { type: 'spring', stiffness: 500, damping: 15 } as const,
} as const;

// ─── Transition Presets ────────────────────────────────────────────────────────
export const TRANSITIONS: Record<string, Transition> = {
  fast:   { duration: 0.15, ease: EASE.out },
  normal: { duration: 0.3,  ease: EASE.smooth },
  slow:   { duration: 0.5,  ease: EASE.smooth },
  spring: SPRINGS.normal,
};

// ─── Entrance Variants ─────────────────────────────────────────────────────────
export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE.smooth } },
};

export const fadeInDown: Variants = {
  hidden:  { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE.smooth } },
};

export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE.bouncy } },
};

export const slideInLeft: Variants = {
  hidden:  { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE.smooth } },
};

export const slideInRight: Variants = {
  hidden:  { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE.smooth } },
};

export const blurIn: Variants = {
  hidden:  { opacity: 0, filter: 'blur(12px)', scale: 0.98 },
  visible: { opacity: 1, filter: 'blur(0px)',  scale: 1, transition: { duration: 0.5, ease: EASE.out } },
};

// ─── Premium Entrance (blur + fade + y) ────────────────────────────────────────
export const blurFadeUp: Variants = {
  hidden:  { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE.smooth } },
};

// ─── List / Stagger Variants ───────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// Faster stagger for grids with many items
export const staggerFast: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
};

export const staggerFastItem: Variants = {
  hidden:  { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: EASE.smooth } },
};

// ─── Card Hover Presets ───────────────────────────────────────────────────────
export const hoverLift   = { y: -4, transition: TRANSITIONS.fast };
export const hoverScale  = { scale: 1.04, transition: TRANSITIONS.fast };
export const hoverGlow   = { scale: 1.02, transition: TRANSITIONS.fast };
export const tapScale    = { scale: 0.96 };

export const cardHover = {
  scale: 1.015,
  y: -2,
  transition: { duration: 0.2, ease: EASE.out },
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

// ─── Page Transition ───────────────────────────────────────────────────────────
export const pageTransition: Variants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE.out } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.25, ease: EASE.in } },
};

// ─── Floating Animation (for decorative elements) ─────────────────────────────
export const floatLoop = {
  y: [0, -12, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: [0.45, 0, 0.55, 1] as [number, number, number, number],
  },
};

// ─── Glow Pulse (for active/highlighted elements) ─────────────────────────────
export const glowPulse = {
  opacity: [0.5, 1, 0.5],
  scale: [1, 1.15, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

// ─── Viewport Settings ─────────────────────────────────────────────────────────
export const VIEWPORT = {
  once: true,
  margin: '-60px',
} as const;

export const VIEWPORT_EAGER = {
  once: true,
  margin: '-20px',
} as const;
