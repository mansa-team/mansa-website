'use client';

import { useEffect, type RefObject } from 'react';

const clamp = (value: number) => Math.max(0, Math.min(1, value));
type Connection = EventTarget & { saveData?: boolean };

/** Owns only --atlas-phase. HTML and SVG start in their complete, readable state. */
export function useAtlasMotion(editorial: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const stage = editorial.current?.closest<HTMLElement>('.atlas-stage');
    if (!stage || !('IntersectionObserver' in window)) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 901px)');
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const articles = [...stage.querySelectorAll<HTMLElement>('[data-principle-panel]')];
    const sticky = [...stage.querySelectorAll<HTMLElement>('.atlas-frame')];
    const inline = [...stage.querySelectorAll<HTMLElement>('.atlas-inline-art')];
    const steps = new Map(
      [...sticky, ...inline].map((figure) => [
        figure,
        [...figure.querySelectorAll<SVGElement>('[data-atlas-step]')].map((node) => {
          const [start, end] = node.dataset.atlasStep!.split(',').map(Number);
          return { node, start, end };
        }),
      ]),
    );
    const apply = (figure: HTMLElement, progress: number) => {
      for (const { node, start, end } of steps.get(figure) ?? []) {
        const phase = String(clamp((progress - start) / (end - start)));
        if (node.style.getPropertyValue('--atlas-phase') !== phase) {
          node.style.setProperty('--atlas-phase', phase);
        }
      }
    };
    const disabled = () => reduced.matches || Boolean(connection?.saveData);
    const seen = new Set<HTMLElement>();
    const running = new Map<HTMLElement, number>();
    let visible = false;
    let frame = 0;
    let disposed = false;
    const finish = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      running.clear();
      for (const figure of steps.keys()) apply(figure, 1);
    };
    const sync = (now: number) => {
      frame = 0;
      if (disposed || document.hidden || disabled()) return;
      if (desktop.matches) {
        if (!visible) return;
        articles.forEach((article, index) => {
          const box = article.getBoundingClientRect();
          // Complete before the end of each reading interval, leaving a calm hold.
          apply(sticky[index], clamp((innerHeight * 0.4 - box.top) / (box.height * 0.55)));
        });
      } else {
        running.forEach((started, figure) => {
          const progress = clamp((now - started) / 560);
          apply(figure, progress);
          if (progress === 1) running.delete(figure);
        });
        if (running.size) frame = requestAnimationFrame(sync);
      }
    };
    const schedule = () => {
      if (!frame && !document.hidden && !disabled() && (visible || running.size)) {
        frame = requestAnimationFrame(sync);
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === stage) {
            visible = entry.isIntersecting;
            if (!visible) {
              cancelAnimationFrame(frame);
              frame = 0;
            }
          } else {
            const figure = entry.target as HTMLElement;
            if (!entry.isIntersecting && running.has(figure)) {
              running.delete(figure);
              apply(figure, 1);
            } else if (entry.isIntersecting && !desktop.matches && !seen.has(figure)) {
              seen.add(figure);
              if (!disabled() && !document.hidden) {
                apply(figure, 0);
                running.set(figure, performance.now());
              }
            }
          }
        }
        schedule();
      },
      { threshold: 0 },
    );
    observer.observe(stage);
    inline.forEach((figure) => observer.observe(figure));
    const preferences = () => {
      stage.dataset.atlasStatic = String(disabled());
      finish();
      schedule();
    };
    const visibility = () => {
      if (document.hidden) finish();
      else schedule();
    };
    const scroll = () => {
      if (desktop.matches) schedule();
    };
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    document.addEventListener('visibilitychange', visibility);
    reduced.addEventListener('change', preferences);
    desktop.addEventListener('change', preferences);
    connection?.addEventListener?.('change', preferences);
    preferences();
    return () => {
      disposed = true;
      finish();
      observer.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
      document.removeEventListener('visibilitychange', visibility);
      reduced.removeEventListener('change', preferences);
      desktop.removeEventListener('change', preferences);
      connection?.removeEventListener?.('change', preferences);
    };
  }, [editorial]);
}
