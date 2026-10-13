'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Sculpture, { type ArtDriver } from './art/Sculpture';
import { sculptureForms } from '@/lib/sculpture-poses';
import '@/styles/studies.css';

const stages = [
  {
    title: 'Matéria',
    text: 'Cada lâmina ocupa seu lugar. A forma ainda é percebida pelas partes.',
  },
  { title: 'Continuidade', text: 'As lâminas se aproximam e passam a compartilhar uma direção.' },
  { title: 'Horizonte', text: 'A relação entre as partes revela uma superfície comum.' },
];

export default function LayerStudy() {
  const [progress, setProgress] = useState(50);
  const [enabled, setEnabled] = useState(false);
  const [view, setView] = useState<'volume' | 'lines'>('volume');
  const driver = useRef<ArtDriver>({ progress: 0.5 });
  useEffect(() => setEnabled(true), []);
  const stage = progress < 34 ? 0 : progress < 67 ? 1 : 2;
  const form = sculptureForms[2 - stage];
  const update = (value: number) => {
    driver.current.progress = 1 - value / 100;
    driver.current.requestRender?.();
    setProgress(value);
  };
  return (
    <main id="conteudo" className="layer-study section-shell">
      <span className="eyebrow">Caderno de direção · Estudo interno</span>
      <div className="layer-study-heading">
        <h1>
          Da matéria
          <br />
          <em>ao horizonte.</em>
        </h1>
        <p>
          Uma exploração da assinatura da Mansa: a continuidade aparece na relação entre as camadas.
          É um estudo visual, sem representar dados, resultados financeiros ou uma funcionalidade do
          produto.
        </p>
      </div>
      <div className="layer-experiment">
        <div
          className="layer-field"
          aria-hidden="true"
          style={{ '--progress': progress / 100 } as CSSProperties}
        >
          {view === 'volume' ? (
            <Sculpture variant="study" driver={driver.current} form={form.id} />
          ) : (
            Array.from({ length: 30 }, (_, index) => (
              <span
                key={index}
                style={{ '--t': index / 29, '--offset': (index - 14.5) / 14.5 } as CSSProperties}
              />
            ))
          )}
        </div>
        <div className="layer-control">
          <fieldset className="layer-view">
            <legend>Ver a composição</legend>
            <label>
              <input
                type="radio"
                name="layer-view"
                disabled={!enabled}
                checked={view === 'volume'}
                onChange={() => setView('volume')}
              />{' '}
              Volume 3D
            </label>
            <label>
              <input
                type="radio"
                name="layer-view"
                disabled={!enabled}
                checked={view === 'lines'}
                onChange={() => setView('lines')}
              />{' '}
              Linhas 2D
            </label>
          </fieldset>
          <label htmlFor="layer-progress">Aproximar as camadas</label>
          <input
            id="layer-progress"
            type="range"
            min="0"
            max="100"
            value={progress}
            disabled={!enabled}
            onChange={(event) => update(Number(event.target.value))}
            aria-valuetext={`${progress} por cento — ${stages[stage].title}`}
            aria-describedby="layer-help"
          />
          <p id="layer-help">
            Use o controle ou as setas do teclado. A composição responde à sua escolha, sem
            movimento automático.
          </p>
          <span className="layer-current">{stages[stage].title}</span>
          <p className="layer-mode-note">
            Com movimento reduzido, economia de dados ou sem WebGL, o volume é apresentado por
            imagens estáticas.
          </p>
        </div>
      </div>
      <section className="form-catalog" aria-labelledby="form-catalog-title">
        <span className="eyebrow">Uma geometria · Três configurações</span>
        <h2 id="form-catalog-title">Estudos da mesma matéria.</h2>
        <div className="form-catalog-grid">
          {sculptureForms.map((item) => (
            <figure key={item.id}>
              <picture>
                <source
                  type="image/avif"
                  srcSet={`/art/${item.id === 'horizon' ? 'horizon-chapter' : item.id}-mobile.avif`}
                />
                <img
                  src={`/art/${item.id === 'horizon' ? 'horizon-chapter' : item.id}-mobile.webp`}
                  alt={`Escultura de lâminas na configuração ${item.name}`}
                  width="480"
                  height="534"
                  loading="lazy"
                />
              </picture>
              <figcaption>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <div className="layer-stages">
        {stages.map((item, index) => (
          <article key={item.title}>
            <span className="eyebrow">0{index + 1}</span>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <p className="layer-study-note">
        Hipótese criativa: uma interação breve pode tornar a ideia de continuidade mais
        compreensível. Sua utilidade precisa ser validada antes de entrar na página principal.
      </p>
      <a className="text-link" href="/estudo/">
        ← Voltar ao caderno de direção
      </a>
    </main>
  );
}
