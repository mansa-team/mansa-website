'use client';
import { useEffect } from 'react';

/** Enhancement only: the server-rendered artwork is always the complete fallback. */
export default function HeroMotion() {
  useEffect(() => {
    const start = () => {
      const art = document.querySelector<HTMLElement>('.hero-art');
      const lens = art?.querySelector<SVGElement>('[data-hero-lens]');
      if (!art || !lens || !Element.prototype.animate) return;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      const fine = matchMedia('(hover: hover) and (pointer: fine)');
      const connection = (
        navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }
      ).connection;
      const animations = new Set<Animation>();
      let pointerFrame = 0;
      let targetX = 0,
        targetY = 0,
        x = 0,
        y = 0;
      let visible = true;
      const limited = () => reduced.matches || !!connection?.saveData;
      const resetPointer = () => {
        cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        targetX = targetY = x = y = 0;
        lens.style.removeProperty('transform');
      };
      const settle = () => {
        animations.forEach((animation) => animation.cancel());
        animations.clear();
        if (art.dataset.motionState === 'opening') art.dataset.motionState = 'settled';
      };
      const animate = (element: Element, keyframes: Keyframe[], duration: number, delay = 0) => {
        const animation = element.animate(keyframes, {
          duration,
          delay,
          easing: 'cubic-bezier(.23,1,.32,1)',
          fill: 'backwards',
        });
        animations.add(animation);
        animation.onfinish = () => {
          animations.delete(animation);
          animation.cancel();
          if (!animations.size) art.dataset.motionState = 'settled';
        };
      };
      const canOpen = !limited() && !location.hash && scrollY < 24 && !document.hidden;
      art.dataset.motionState = canOpen ? 'opening' : 'static';
      if (canOpen) {
        art.querySelectorAll('.atlas-field-lines path').forEach((path, index) => {
          animate(
            path,
            [
              { opacity: 0, transform: 'translateY(10px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            560,
            Math.min(index * 7, 150),
          );
        });
        const reveal = art.querySelector('[data-hero-lens-reveal]');
        if (reveal)
          animate(
            reveal,
            [
              { opacity: 0.2, transform: 'translateX(-16px)' },
              { opacity: 1, transform: 'translateX(0)' },
            ],
            640,
            120,
          );
        art.querySelectorAll<SVGPathElement>('[data-hero-connection]').forEach((path) => {
          const length = path.getTotalLength();
          animate(
            path,
            [
              { strokeDasharray: `${length}`, strokeDashoffset: `${length}` },
              { strokeDasharray: `${length}`, strokeDashoffset: '0' },
            ],
            440,
            300,
          );
        });
        const labels = art.querySelector('[data-hero-labels]');
        if (labels) animate(labels, [{ opacity: 0.25 }, { opacity: 1 }], 360, 400);
      }
      const tick = () => {
        x += (targetX - x) * 0.16;
        y += (targetY - y) * 0.16;
        lens.style.transform = `translate(${x.toFixed(3)}px, ${y.toFixed(3)}px)`;
        if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.025)
          pointerFrame = requestAnimationFrame(tick);
        else {
          pointerFrame = 0;
          if (targetX === 0 && targetY === 0) resetPointer();
        }
      };
      const pointer = (event: PointerEvent) => {
        if (
          limited() ||
          !fine.matches ||
          event.pointerType !== 'mouse' ||
          !visible ||
          document.hidden
        )
          return;
        const rect = art.getBoundingClientRect();
        targetX = Math.max(
          -10,
          Math.min(10, ((event.clientX - rect.left) / rect.width - 0.5) * 20),
        );
        targetY = Math.max(-6, Math.min(6, ((event.clientY - rect.top) / rect.height - 0.5) * 12));
        if (!pointerFrame) pointerFrame = requestAnimationFrame(tick);
      };
      const leave = () => {
        targetX = targetY = 0;
        if (!pointerFrame && (x || y)) pointerFrame = requestAnimationFrame(tick);
      };
      const interrupt = () => {
        settle();
        resetPointer();
      };
      const preferences = () => {
        if (limited() || !fine.matches) interrupt();
      };
      const visibility = () => {
        if (document.hidden) interrupt();
      };
      const observer =
        'IntersectionObserver' in window
          ? new IntersectionObserver((entries) => {
              visible = entries[0].isIntersecting;
              if (!visible) interrupt();
            })
          : null;
      observer?.observe(art);
      art.addEventListener('pointermove', pointer);
      art.addEventListener('pointerleave', leave);
      document.addEventListener('keydown', interrupt, true);
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('scroll', interrupt, { passive: true });
      reduced.addEventListener('change', preferences);
      fine.addEventListener('change', preferences);
      connection?.addEventListener?.('change', preferences);
      return () => {
        interrupt();
        observer?.disconnect();
        art.removeEventListener('pointermove', pointer);
        art.removeEventListener('pointerleave', leave);
        document.removeEventListener('keydown', interrupt, true);
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('scroll', interrupt);
        reduced.removeEventListener('change', preferences);
        fine.removeEventListener('change', preferences);
        connection?.removeEventListener?.('change', preferences);
      };
    };
    let cleanup: (() => void) | undefined;
    let started = false;
    const begin = () => {
      if (started) return;
      started = true;
      cleanup = start();
    };
    window.addEventListener('mansa:entry-reveal', begin);
    window.addEventListener('mansa:entry-complete', begin);
    if (document.documentElement.dataset.entry !== 'loading') begin();
    return () => {
      window.removeEventListener('mansa:entry-reveal', begin);
      window.removeEventListener('mansa:entry-complete', begin);
      cleanup?.();
    };
  }, []);
  return null;
}
