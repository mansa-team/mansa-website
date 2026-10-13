'use client';
import { useEffect } from 'react';

/** One owner for finite editorial entrances. Useful HTML never depends on animation. */
export default function EditorialMotion() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & { connection?: Partial<EventTarget> & { saveData?: boolean } }
    ).connection;
    const limited = () => reduced.matches || !!connection?.saveData;
    const easing =
      getComputedStyle(document.documentElement).getPropertyValue('--ease-settle').trim() ||
      'cubic-bezier(.23,1,.32,1)';
    const seen = new Set<Element>();
    const animations = new Map<Element, Animation[]>();
    const targets = [...document.querySelectorAll<HTMLElement>('[data-editorial-reveal]')];
    const finish = (element: Element) => {
      seen.add(element);
      animations.get(element)?.forEach((animation) => animation.cancel());
      animations.delete(element);
      observer.unobserve(element);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            if (animations.has(entry.target)) finish(entry.target);
            continue;
          }
          if (seen.has(entry.target)) continue;
          const element = entry.target as HTMLElement;
          seen.add(element);
          if (limited() || document.hidden || element.contains(document.activeElement)) {
            observer.unobserve(element);
            continue;
          }
          const kind = element.dataset.motionKind;
          const duration = kind === 'heading' ? 520 : kind === 'document' ? 500 : 420;
          const distance = kind === 'heading' ? 18 : kind === 'research' ? 8 : 12;
          const group = [
            element.animate(
              [
                { opacity: 0.4, transform: `translateY(${distance}px)` },
                { opacity: 1, transform: 'translateY(0)' },
              ],
              { duration, delay: Number(element.dataset.motionOrder || 0) * 60, easing },
            ),
          ];
          const drawing = kind === 'research' ? element.querySelector('svg') : null;
          if (drawing)
            group.push(
              drawing.animate(
                [
                  { opacity: 0.4, transform: 'translateY(6px)' },
                  { opacity: 1, transform: 'translateY(0)' },
                ],
                { duration: 600, delay: Number(element.dataset.motionOrder || 0) * 60, easing },
              ),
            );
          animations.set(element, group);
          group.forEach((animation) => {
            animation.onfinish = () => {
              animation.cancel();
              if (group.every((item) => item.playState === 'idle')) {
                animations.delete(element);
                observer.unobserve(element);
              }
            };
          });
        }
      },
      { threshold: 0, rootMargin: '0px 0px -24px 0px' },
    );
    for (const element of targets) {
      if (element.getBoundingClientRect().top < innerHeight || limited()) seen.add(element);
      else observer.observe(element);
    }
    const focus = (event: FocusEvent) => {
      for (const element of targets) if (element.contains(event.target as Node)) finish(element);
    };
    const anchor = () => {
      let id: string;
      try {
        id = decodeURIComponent(location.hash.slice(1));
      } catch {
        return;
      }
      const destination = document.getElementById(id);
      if (destination)
        for (const element of targets)
          if (element.contains(destination) || destination.contains(element)) finish(element);
    };
    const preferences = () => {
      if (limited()) targets.forEach(finish);
    };
    const cancel = () => {
      for (const element of animations.keys()) finish(element);
    };
    const visibility = () => {
      if (document.hidden) cancel();
    };
    document.addEventListener('focusin', focus);
    document.addEventListener('keydown', cancel, true);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('hashchange', anchor);
    reduced.addEventListener('change', preferences);
    connection?.addEventListener?.('change', preferences);
    return () => {
      observer.disconnect();
      cancel();
      document.removeEventListener('focusin', focus);
      document.removeEventListener('keydown', cancel, true);
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('hashchange', anchor);
      reduced.removeEventListener('change', preferences);
      connection?.removeEventListener?.('change', preferences);
    };
  }, []);
  return null;
}
