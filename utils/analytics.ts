export type ToolEventName =
  | 'tool_action'
  | 'tool_success'
  | 'tool_error'
  | 'tool_copy'
  | 'tool_download'
  | 'tool_sample';

export interface ToolEventParams {
  tool_id?: string;
  tool_name?: string;
  action?: string;
  label?: string;
  method?: string;
  status?: string;
  value?: number;
}

export function getToolIdFromPath(pathname: string): string {
  const match = pathname.match(/^\/tools\/([^/?#]+)/);
  return match?.[1] || 'unknown';
}

export function trackToolEvent(eventName: ToolEventName, params: ToolEventParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, {
    event_category: 'tool',
    ...params,
  });
}

export function getToolActionFromLabel(label: string): ToolEventName | null {
  const normalized = label.toLowerCase();

  if (normalized.includes('copy')) return 'tool_copy';
  if (normalized.includes('download') || normalized.includes('export')) return 'tool_download';
  if (normalized.includes('sample') || normalized.includes('example') || normalized.includes('random size')) {
    return 'tool_sample';
  }

  return null;
}
