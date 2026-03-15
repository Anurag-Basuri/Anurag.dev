/**
 * design-system/index.ts
 * Barrel export for the entire design system.
 */

// Tokens
export * from './tokens';

// Motion
export * from './motion';

// Theme
export * from './theme-context';

// Error system
export { ErrorBoundary, withErrorBoundary } from './error/ErrorBoundary';
export { ErrorReporter } from './error/ErrorReporter';
export { useErrorToast } from './error/useErrorToast';

// UI
export { ThemeSelector } from './ui/ThemeSelector';

// Background
export { Scene3D } from './background/Scene3D';

