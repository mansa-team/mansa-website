'use client';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useArtCapability } from '@/lib/use-art-capability';
import type { SceneProps } from './SculptureScene';
import type { SculptureForm } from '@/lib/sculpture-poses';

export type ArtDriver = {
  progress: number;
  immediate?: boolean;
  pointer?: { x: number; y: number };
  requestRender?: () => void;
};
export default function Sculpture({
  variant = 'hero',
  driver,
  form = 'horizon',
}: {
  variant?: 'hero' | 'chapter' | 'study';
  driver?: ArtDriver;
  form?: SculptureForm;
}) {
  const host = useRef<HTMLDivElement>(null);
  const ownDriver = useRef<ArtDriver>({ progress: 0 });
  const allowed = useArtCapability();
  const [Renderer, setRenderer] = useState<ComponentType<SceneProps> | null>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mobile, setMobile] = useState(false);
  const activeDriver = driver || ownDriver.current;
  const posterName = variant !== 'hero' && form === 'horizon' ? 'horizon-chapter' : form;
  useEffect(() => {
    const element = host.current;
    if (!element || variant !== 'hero' || !allowed || paused || failed) return;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const reset = () => {
      activeDriver.pointer = { x: 0, y: 0 };
      activeDriver.requestRender?.();
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType !== 'mouse') return;
      const bounds = element.getBoundingClientRect();
      activeDriver.pointer = {
        x: Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2)),
        y: Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2)),
      };
      activeDriver.requestRender?.();
    };
    element.addEventListener('pointermove', move, { passive: true });
    element.addEventListener('pointerleave', reset);
    fine.addEventListener('change', reset);
    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
      fine.removeEventListener('change', reset);
      reset();
    };
  }, [variant, allowed, paused, failed, activeDriver]);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '80px',
      threshold: 0.01,
    });
    observer.observe(element);
    const resize = () => setMobile(innerWidth < 760);
    resize();
    window.addEventListener('resize', resize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);
  useEffect(() => {
    if (!allowed || !visible || Renderer || failed) return;
    let canceled = false;
    const timeout = setTimeout(async () => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2');
        if (!gl) {
          setFailed(true);
          return;
        }
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        const module = await import('./SculptureScene');
        if (!canceled) setRenderer(() => module.default);
      } catch {
        if (!canceled) setFailed(true);
      }
    }, 600);
    return () => {
      canceled = true;
      clearTimeout(timeout);
    };
  }, [allowed, visible, Renderer, failed]);
  const enhanced = allowed && !failed && Renderer;
  return (
    <div className={`art-container art-container--${variant}`}>
      <div
        ref={host}
        className={`sculpture${enhanced && ready ? ' ready' : ''}`}
        data-sculpture="interactive"
        data-sculpture-form={form}
        aria-hidden="true"
      >
        <picture>
          <source
            media="(max-width: 760px)"
            type="image/avif"
            srcSet={`/art/${posterName}-mobile.avif`}
          />
          <source type="image/avif" srcSet={`/art/${posterName}.avif`} />
          <source media="(max-width: 760px)" srcSet={`/art/${posterName}-mobile.webp`} />
          <img
            className="sculpture-poster"
            src={`/art/${posterName}.webp`}
            alt=""
            width="900"
            height="1000"
            loading={variant === 'hero' ? 'eager' : 'lazy'}
            fetchPriority={variant === 'hero' ? 'high' : 'auto'}
          />
        </picture>
        {enhanced && (
          <Renderer
            variant={variant}
            driver={activeDriver}
            active={visible}
            paused={paused}
            mobile={mobile}
            onReady={() => setReady(true)}
            onFailure={() => {
              setFailed(true);
              setReady(false);
            }}
          />
        )}
      </div>
      {enhanced && ready && variant !== 'study' && (
        <button
          className="motion-control"
          data-motion-toggle
          aria-pressed={paused}
          aria-label={paused ? 'Retomar movimento da escultura' : 'Pausar movimento da escultura'}
          onClick={() => setPaused((value) => !value)}
        >
          <span className="pause-symbol" aria-hidden="true">
            {paused ? '▷' : 'Ⅱ'}
          </span>
          <span data-motion-label>{paused ? 'Retomar movimento' : 'Pausar movimento'}</span>
        </button>
      )}
    </div>
  );
}
