import type { Feeling } from '@/components/buddy/types';
import type { BuddyAction } from '@/data/buddy';

// Tiny event bus so pages can talk to the site buddy without prop drilling.

export type BuddyEvent =
  | { type: 'say'; text: string; actions?: BuddyAction[]; ms?: number }
  | { type: 'feel'; feeling: Feeling; ms: number };

const listeners = new Set<(e: BuddyEvent) => void>();

export const buddy = {
  /** Show a speech bubble (auto-hides after `ms`). */
  say(text: string, opts: { actions?: BuddyAction[]; ms?: number } = {}) {
    listeners.forEach(cb => cb({ type: 'say', text, ...opts }));
  },
  /** Show a feeling for `ms`, then go back to normal. */
  feel(feeling: Feeling, ms = 2000) {
    listeners.forEach(cb => cb({ type: 'feel', feeling, ms }));
  },
  on(cb: (e: BuddyEvent) => void) {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
};
