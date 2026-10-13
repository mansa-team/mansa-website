'use client';
import { useEffect, useRef, useState } from 'react';
import { principles } from '@/content/site';
import AtlasDiagram from './art/AtlasDiagram';
import { useAtlasMotion } from './motion/AtlasMotion';
import '@/styles/atlas.css';

const details = [
  'Empresas, fundamentos e contexto.',
  'Aportes, rotina e horizonte.',
  'Informação, explicação e autonomia.',
];

export default function Principles() {
  const editorial = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  useAtlasMotion(editorial);

  useEffect(() => {
    const element = editorial.current;
    if (!element) return;
    const articles = [...element.querySelectorAll<HTMLElement>('[data-principle-panel]')];
    let frame = 0;
    const sync = () => {
      frame = 0;
      const marker = innerHeight * 0.4;
      let index = 0;
      articles.forEach((article, position) => {
        if (article.getBoundingClientRect().top <= marker) index = position;
      });
      setActive(index);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };
    sync();
    setEnhanced(true);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, []);

  return (
    <section id="proposta" className="atlas-section" aria-labelledby="approach-title">
      <div className="atlas-inner">
        <div className="atlas-heading">
          <p className="atlas-kicker">Nossa proposta</p>
          <h2 id="approach-title">
            Entender.
            <br />
            Construir. <em>Aprender.</em>
          </h2>
          <p className="atlas-intro">
            Três princípios orientam a experiência que estamos desenvolvendo para o investimento de
            longo prazo.
          </p>
        </div>
        <div
          className="atlas-stage"
          data-principles
          data-enhanced={enhanced || undefined}
          data-active-principle={principles[active].id}
        >
          <aside className="atlas-sticky" aria-label="Atlas da compreensão">
            <div className="atlas-figure-top">
              <span>Atlas da compreensão</span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className="atlas-frames" aria-hidden="true">
              {principles.map((principle, index) => (
                <div className="atlas-frame" data-active={active === index} key={principle.id}>
                  <AtlasDiagram index={index} />
                </div>
              ))}
            </div>
            <p className="atlas-caption" data-art-caption>
              {principles[active].label}
              <span>Estudo conceitual</span>
            </p>
            <nav className="atlas-index" aria-label="Princípios da Mansa">
              {principles.map((principle, index) => (
                <a
                  href={`#principio-${principle.id}`}
                  key={principle.id}
                  aria-current={active === index ? 'location' : undefined}
                >
                  <span className="atlas-index-dot" aria-hidden="true" />
                  {principle.title}
                </a>
              ))}
            </nav>
          </aside>
          <div className="atlas-editorial" ref={editorial}>
            {principles.map((principle, index) => (
              <article
                id={`principio-${principle.id}`}
                key={principle.id}
                data-principle-panel={principle.id}
                className="atlas-article"
                aria-labelledby={`heading-${principle.id}`}
              >
                <div className="atlas-inline-art">
                  <AtlasDiagram index={index} />
                </div>
                <p className="atlas-article-label">
                  <span aria-hidden="true" />
                  {principle.title}
                </p>
                <h3 id={`heading-${principle.id}`}>{principle.short}</h3>
                <p className="atlas-description">{principle.description}</p>
                <p className="atlas-detail">{details[index]}</p>
              </article>
            ))}
            <p className="atlas-note">
              Princípios de uma experiência em desenvolvimento. Cada etapa precisa ser validada.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
