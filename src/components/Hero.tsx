import Link from 'next/link';
import Arrow from './Arrow';
import HorizonAtlas from './art/HorizonAtlas';
import HeroMotion from './motion/HeroMotion';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-kicker">
        <span className="eyebrow">Tecnologia com perspectiva</span>
        <span className="hero-location">Feito no Brasil. Pensado para o futuro.</span>
      </div>
      <div className="hero-copy">
        <h1 id="hero-title">
          <span>Clareza para construir.</span>
          <span className="hero-time">
            No seu tempo<span className="hero-period">.</span>
          </span>
        </h1>
        <div className="hero-summary">
          <p>
            Tecnologia e educação para aproximar a classe média brasileira do investimento de longo
            prazo.
          </p>
          <div className="hero-action">
            <Link className="button button-dark" href="/contato/">
              Converse sobre o projeto <Arrow />
            </Link>
            <p className="hero-stage">
              <span className="status-dot" aria-hidden="true" />
              <strong>Um projeto em desenvolvimento.</strong>
            </p>
          </div>
        </div>
      </div>
      <figure className="hero-art">
        <HorizonAtlas />
        <HeroMotion />
        <figcaption className="hero-art-caption">
          <span>Empresas. Fundamentos. Contexto.</span>
          <a href="#perspectiva">
            Um outro olhar para investir <span aria-hidden="true">↓</span>
          </a>
        </figcaption>
      </figure>
      <p className="hero-audience">Aberto a investidores no projeto, parceiros e apoiadores.</p>
    </section>
  );
}
