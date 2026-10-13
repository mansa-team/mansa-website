import type { CSSProperties } from 'react';
import { pageMetadata } from '@/lib/metadata';
export const metadata = pageMetadata('Estudos de direção — Mansa', '/estudo/', true);
import Arrow from '@/components/Arrow';
import '@/styles/studies.css';
export default function Study() {
  return (
    <main id="conteudo" className="study-page">
      <span className="eyebrow">Caderno de direção · Apresentação interna</span>
      <h1>
        Três leituras.
        <br />
        <em>Uma intenção.</em>
      </h1>
      <p className="study-intro">
        A mesma proposta editorial, explorada por estrutura, matéria e proximidade. Estudos de
        composição para comparar identidade, clareza e viabilidade.
      </p>
      <p className="study-update">
        Nova exploração: <a href="/estudo/camadas/">Da matéria ao horizonte ↗</a>. Um controle
        manual aproxima as camadas; o estudo permanece separado da experiência principal.
      </p>
      <article className="study">
        <div className="study-label">
          <span className="eyebrow">Clareza construída</span>
          <a href="/estudo/clareza/">
            Abrir experimento <Arrow />
          </a>
        </div>
        <div className="concept concept-clarity">
          <div className="concept-copy">
            <span className="eyebrow">Tecnologia com perspectiva</span>
            <h2>
              Clareza para
              <br />
              construir.
              <br />
              <em>No seu tempo.</em>
            </h2>
            <p>
              Estamos aproximando os brasileiros do investimento de longo prazo. Com tecnologia,
              educação e uma visão que vai além do agora.
            </p>
            <a href="/contato/">Construa com a Mansa ↗</a>
          </div>
          <div className="clarity-object" aria-hidden="true">
            {Array.from({ length: 24 }, (_, i) => (
              <span key={i} style={{ '--i': i } as CSSProperties}></span>
            ))}
          </div>
        </div>
        <p>
          A organização é visível. O experimento revela como elementos ganham uma estrutura comum.
          Risco: a geometria racional se aproxima de outras marcas de tecnologia.
        </p>
      </article>
      <article className="study">
        <div className="study-label">
          <span className="eyebrow">Tempo como matéria · Direção selecionada</span>
          <a href="/">
            Abrir experiência <Arrow />
          </a>
        </div>
        <div className="concept concept-time">
          <div className="concept-copy">
            <span className="eyebrow">Tecnologia com perspectiva</span>
            <h2>
              Clareza para
              <br />
              construir.
              <br />
              <em>No seu tempo.</em>
            </h2>
            <p>
              Estamos aproximando os brasileiros do investimento de longo prazo. Com tecnologia,
              educação e uma visão que vai além do agora.
            </p>
            <a href="/contato/">Construa com a Mansa ↗</a>
          </div>
          <img
            src="/art/horizon.webp"
            alt="Estudo de lâminas que formam uma superfície contínua"
            width="900"
            height="1000"
          />
        </div>
        <p>
          A constância ganha presença física por meio de camadas. A escultura e a tipografia
          oferecem uma assinatura que pode atravessar todo o site, com uma versão estática própria.
        </p>
      </article>
      <article className="study">
        <div className="study-label">
          <span className="eyebrow">Proximidade institucional</span>
          <span className="eyebrow">Estudo tipográfico</span>
        </div>
        <div className="concept concept-proximity">
          <div className="proximity-word" aria-hidden="true">
            brasil
            <br />
            <i>adiante.</i>
          </div>
          <div className="concept-copy">
            <span className="eyebrow">Tecnologia com perspectiva</span>
            <h2>
              Clareza para construir.
              <br />
              <em>No seu tempo.</em>
            </h2>
            <p>
              Estamos aproximando os brasileiros do investimento de longo prazo. Com tecnologia,
              educação e uma visão que vai além do agora.
            </p>
            <a href="/contato/">Construa com a Mansa ↗</a>
          </div>
        </div>
        <p>
          A identidade se aproxima das pessoas através da voz editorial. Seu desenvolvimento
          completo precisa de fotografia e retratos reais; não foram criados substitutos artificiais
          para os fundadores.
        </p>
      </article>
    </main>
  );
}
