import Link from 'next/link';
import Arrow from '@/components/Arrow';
import Hero from '@/components/Hero';
import Principles from '@/components/Principles';
import ResearchDrawing from '@/components/art/ResearchDrawing';
import EditorialMotion from '@/components/motion/EditorialMotion';
import { research, site } from '@/content/site';

export default function Home() {
  return (
    <main id="conteudo" className="atlas-home">
      <EditorialMotion />
      <Hero />
      <section
        id="perspectiva"
        className="intro-section section-shell"
        aria-labelledby="intro-title"
      >
        <div className="section-meta">
          <span className="eyebrow">O ponto de partida</span>
          <span className="section-mark" aria-hidden="true">
            ↘
          </span>
        </div>
        <div className="intro-main" data-editorial-reveal data-motion-kind="heading">
          <h2 id="intro-title">
            Entre a informação e a decisão,
            <br />
            <span>existe compreensão.</span>
          </h2>
          <div className="intro-bottom">
            <p>Compreender faz parte de investir.</p>
            <p>
              Para muita gente, o mercado de ações ainda parece distante. Falta tempo, a informação
              é complexa e o receio de dar o primeiro passo permanece. Esse é o ponto de partida da
              Mansa.
            </p>
          </div>
        </div>
        <div className="barriers">
          <span>Tempo para entender.</span>
          <span>Contexto para decidir.</span>
          <span>Espaço para aprender.</span>
        </div>
      </section>
      <Principles />
      <section
        id="pesquisa"
        className="research-section section-shell"
        aria-labelledby="research-title"
      >
        <div className="section-meta">
          <span className="eyebrow">Em construção</span>
          <span className="section-mark" aria-hidden="true">
            ↘
          </span>
        </div>
        <div className="research-heading" data-editorial-reveal data-motion-kind="heading">
          <h2 id="research-title">
            Uma ideia com
            <br />
            trabalho por trás.
          </h2>
          <p>
            Pesquisa de modelos, estruturas de dados e organização de carteiras: estas são as
            frentes em que a proposta começa a tomar forma.
          </p>
        </div>
        <div className="research-list">
          {research.map((item, index) => (
            <article
              className="research-row"
              key={item.category}
              data-editorial-reveal
              data-motion-order={index}
              data-motion-kind="research"
            >
              <div className="research-visual" aria-hidden="true">
                <ResearchDrawing index={index} />
              </div>
              <div className="research-title">
                <span className="eyebrow">{item.category}</span>
                <h3>{item.title}</h3>
              </div>
              <p>{item.text}</p>
              <span className="research-status">
                <span aria-hidden="true" />
                {item.status}
              </span>
            </article>
          ))}
        </div>
        <article
          className="research-notebook"
          data-motion-kind="document"
          aria-labelledby="notebook-title"
          data-editorial-reveal
        >
          <div className="notebook-intro">
            <span className="eyebrow">Caderno de construção · Pesquisa pública</span>
            <h3 id="notebook-title">Uma base que pode ser consultada.</h3>
            <p>
              O repositório de pesquisa reúne estudos de modelos de mercado, aprendizado de máquina
              e infraestrutura. Artigos, testes e arquivos de pesquisa fazem parte dessa base.
            </p>
            <a
              className="text-link"
              href={site.researchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Conhecer a base de pesquisa <Arrow />
            </a>
          </div>
          <div className="notebook-detail">
            <blockquote className="source-excerpt">
              <cite>mansa-team / musa — README</cite>
              <p lang="en">
                “This repository is dedicated to research market models, ML models, infraestructure
                and more”
              </p>
            </blockquote>
            <dl>
              <div>
                <dt>Objeto de estudo</dt>
                <dd>Modelos de mercado e interpretação de informações.</dd>
              </div>
              <div>
                <dt>Material disponível</dt>
                <dd>Artigos, testes, arquivos de pesquisa e documentação.</dd>
              </div>
              <div>
                <dt>Limite desta base</dt>
                <dd>
                  Pesquisa em desenvolvimento. A experiência para o público ainda precisa ser
                  validada.
                </dd>
              </div>
            </dl>
            <p className="notebook-source">
              Fonte: apresentação pública do repositório de pesquisa da Mansa.
            </p>
          </div>
        </article>
        <div className="research-foot">
          <p>Para aprofundar: a estrutura técnica também está documentada.</p>
          <a className="text-link" href={site.serverUrl} target="_blank" rel="noopener noreferrer">
            Consultar a estrutura técnica <Arrow />
          </a>
        </div>
      </section>
      <section id="origem" className="origin-section section-shell" aria-labelledby="origin-title">
        <div className="section-meta">
          <span className="eyebrow">A Mansa · Origem e fundadores</span>
          <span className="section-mark" aria-hidden="true">
            ↘
          </span>
        </div>
        <div className="origin-story" data-editorial-reveal data-motion-kind="heading">
          <h2 id="origin-title">Um nome que olha para a história.</h2>
          <p>
            Inspirado em Mansa Musa, nosso nome abre uma reflexão sobre patrimônio, conhecimento e o
            que permanece ao longo do tempo.
          </p>
        </div>
        <div className="origin-copy" data-editorial-reveal data-motion-kind="document">
          <h3>Quem está construindo.</h3>
          <p>
            A Mansa é um projeto brasileiro, fundado por David Rangel e Heitor Rosa, com a intenção
            de tornar o investimento de longo prazo mais compreensível para a classe média.
          </p>
          <div className="founders">
            <div>
              <span>David Rangel</span>
              <small>Fundador</small>
            </div>
            <div>
              <span>Heitor Rosa</span>
              <small>Fundador</small>
            </div>
          </div>
          <Link className="text-link" href="/contato/">
            Conversar com os fundadores <Arrow />
          </Link>
        </div>
      </section>
      <section className="invitation-section section-shell" aria-labelledby="invitation-title">
        <div className="section-meta">
          <span className="eyebrow">O próximo capítulo</span>
          <span className="section-mark" aria-hidden="true">
            ↗
          </span>
        </div>
        <div className="invitation-content" data-editorial-reveal>
          <h2 id="invitation-title">Boas ideias precisam de gente que olhe adiante.</h2>
          <div className="invitation-bottom">
            <p>
              Procuramos investidores, parceiros e apoiadores que compartilhem dessa visão e queiram
              participar da construção da Mansa.
            </p>
            <Link className="button button-light" href="/contato/">
              Vamos conversar <Arrow />
            </Link>
          </div>
        </div>
        <div className="participation-links">
          <Link href="/contato/?interesse=Investimento%20no%20projeto">
            Investir no projeto <Arrow />
          </Link>
          <Link href="/contato/?interesse=Parceria">
            Construir uma parceria <Arrow />
          </Link>
          <Link href="/contato/?interesse=Apoio%20ao%20desenvolvimento">
            Apoiar o desenvolvimento <Arrow />
          </Link>
        </div>
      </section>
    </main>
  );
}
