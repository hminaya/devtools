/**
 * Google Analytics gtag type definitions
 */

export {};

declare global {
  interface Window {
    gtag?: {
      (command: 'config' | 'event' | 'js' | 'set', targetId: string, config?: Record<string, unknown>): void;
      (command: 'consent', action: 'default' | 'update', params: Record<string, string>): void;
    };
    dataLayer?: unknown[];
  }
}
