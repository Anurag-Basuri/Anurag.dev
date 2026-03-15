/**
 * design-system/error/ErrorReporter.ts
 * Singleton for centralized error collection.
 * All caught errors flow through here so we can log, deduplicate, or send to analytics.
 */

export interface CaptureOptions {
  label?: string;
  componentStack?: string;
  extra?: Record<string, unknown>;
}

interface ErrorEntry {
  error: Error;
  options: CaptureOptions;
  timestamp: number;
}

class ErrorReporterSingleton {
  private entries: ErrorEntry[] = [];
  private maxEntries = 50;

  capture(error: Error, options: CaptureOptions = {}) {
    const entry: ErrorEntry = {
      error,
      options,
      timestamp: Date.now(),
    };

    this.entries = [entry, ...this.entries].slice(0, this.maxEntries);

    if (process.env.NODE_ENV === 'development') {
      console.group(`[ErrorReporter] ${options.label ?? 'Uncaught Error'}`);
      console.error(error);
      if (options.componentStack) {
        console.error('Component Stack:', options.componentStack);
      }
      console.groupEnd();
    }

    // TODO: Send to analytics/Sentry in production
    // if (process.env.NODE_ENV === 'production') { sendToSentry(entry); }
  }

  captureAsync(error: unknown, label?: string) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.capture(err, { label });
  }

  getEntries(): readonly ErrorEntry[] {
    return this.entries;
  }

  clear() {
    this.entries = [];
  }
}

export const ErrorReporter = new ErrorReporterSingleton();

