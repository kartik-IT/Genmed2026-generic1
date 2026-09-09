/**
 * useFocusTrap
 *
 * Traps keyboard focus inside a container element while it is active.
 * Returns a ref to attach to the container.
 *
 * Usage:
 *   const containerRef = useFocusTrap(isOpen);
 *   <div ref={containerRef}>…</div>
 */

import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'details > summary',
].join(', ');

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(active: boolean) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    // Move focus into the trap on activation
    const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.closest('[hidden]'));

      if (focusable.length === 0) { e.preventDefault(); return; }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return containerRef;
}
