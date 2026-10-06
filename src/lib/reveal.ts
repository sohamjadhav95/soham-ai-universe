// Tiny signal between the curtains (preloader / page transition) and pages:
// a page sets its entrance state on mount, then plays it when the curtain lifts.
let revealed = false;
const listeners = new Set<() => void>();

export function markCovered() {
  revealed = false;
}

export function emitReveal() {
  revealed = true;
  listeners.forEach(cb => cb());
  listeners.clear();
}

export function onReveal(cb: () => void) {
  if (revealed) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
