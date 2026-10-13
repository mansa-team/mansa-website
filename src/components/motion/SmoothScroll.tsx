'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/** Wheel-only enhancement. The browser/Next remain the sole owners of navigation and focus. */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const desktop = matchMedia('(min-width: 1080px) and (hover: hover) and (pointer: fine)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;
    let instance: Lenis | undefined;
    let generation = 0;
    let disposed = false;
    let frame = 0;

    const stopClock = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const tick = (time: number) => {
      frame = 0;
      if (!instance || document.hidden) return;
      instance.raf(time);
      if (instance.isScrolling === 'smooth') frame = requestAnimationFrame(tick);
    };

    const cancelInertia = () => {
      stopClock();
      if (instance?.isScrolling === 'smooth') {
        instance.scrollTo(window.scrollY, { immediate: true });
      }
    };
    const destroy = () => {
      stopClock();
      // Remove wheel interception without ever locking the page.
      instance?.destroy();
      instance = undefined;
    };
    const update = () => {
      const request = ++generation;
      destroy();
      if (
        disposed ||
        !desktop.matches ||
        reduced.matches ||
        connection?.saveData ||
        document.hidden
      )
        return;
      void import('lenis')
        .then(({ default: LenisConstructor }) => {
          if (disposed || request !== generation) return;
          instance = new LenisConstructor({
            autoRaf: false,
            lerp: 0.22,
            smoothWheel: true,
            syncTouch: false,
            anchors: false,
            respectReducedMotion: true,
            // Textareas, native selects and explicitly nested content keep native gestures.
            prevent: (node) =>
              node instanceof HTMLElement &&
              (node.matches('textarea, select, [data-native-scroll]') || node.isContentEditable),
          });
          instance.on('virtual-scroll', ({ event, deltaY }) => {
            if (event.type !== 'wheel' || event.ctrlKey || !deltaY || frame || !instance) return;
            // Lenis emits this before starting its wheel animation. Prime the timestamp while
            // at rest so a new gesture never inherits the elapsed idle interval as its delta.
            instance.raf(performance.now());
            frame = requestAnimationFrame(tick);
          });
        })
        .catch(() => {
          // A missing optional chunk leaves the document's native scrolling untouched.
        });
    };
    const keydown = (event: KeyboardEvent) => {
      if (
        [
          'Tab',
          ' ',
          'Home',
          'End',
          'PageUp',
          'PageDown',
          'ArrowUp',
          'ArrowDown',
          'Escape',
        ].includes(event.key)
      )
        cancelInertia();
      // Never prevent keyboard defaults or synthesize keyboard scrolling.
    };
    const click = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href]')) cancelInertia();
    };

    desktop.addEventListener('change', update);
    reduced.addEventListener('change', update);
    connection?.addEventListener?.('change', update);
    document.addEventListener('visibilitychange', update);
    document.addEventListener('keydown', keydown, true);
    document.addEventListener('click', click, true);
    document.addEventListener('pointerdown', cancelInertia, { capture: true, passive: true });
    document.addEventListener('focusin', cancelInertia, true);
    window.addEventListener('hashchange', cancelInertia);
    window.addEventListener('popstate', cancelInertia);
    update();
    return () => {
      disposed = true;
      generation++;
      destroy();
      desktop.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
      connection?.removeEventListener?.('change', update);
      document.removeEventListener('visibilitychange', update);
      document.removeEventListener('keydown', keydown, true);
      document.removeEventListener('click', click, true);
      document.removeEventListener('pointerdown', cancelInertia, true);
      document.removeEventListener('focusin', cancelInertia, true);
      window.removeEventListener('hashchange', cancelInertia);
      window.removeEventListener('popstate', cancelInertia);
    };
  }, [pathname]);

  return null;
}
