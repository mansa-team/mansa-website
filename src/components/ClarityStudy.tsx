'use client';
import { useState, type CSSProperties } from 'react';
import Arrow from '@/components/Arrow';
import '@/styles/studies.css';
export default function ClarityStudy() {
  const [progress, setProgress] = useState(0);
  return (
    <main id="conteudo" className="clarity-study">
      <div className="clarity-copy">
        <span className="eyebrow">Experimento de direção · Clareza construída</span>
        <h1>
          Clareza para
          <br />
          construir.
          <br />
          <em>No seu tempo.</em>
        </h1>
        <p>
          Estamos aproximando os brasileiros do investimento de longo prazo. Com tecnologia,
          educação e uma visão que vai além do agora.
        </p>
        <a className="button button-dark" href="/contato/">
          Construa com a Mansa <Arrow />
        </a>
      </div>
      <div className="clarity-experiment">
        <div
          className="clarity-field"
          aria-hidden="true"
          style={{ '--progress': progress / 100 } as CSSProperties}
        >
          {Array.from({ length: 42 }, (_, i) => (
            <span
              key={i}
              style={
                {
                  '--angle': `${Math.sin(i * 2.8) * 50}deg`,
                  '--dx': `${Math.sin(i * 1.2) * 70}px`,
                  '--dy': `${Math.cos(i * 1.7) * 65}px`,
                  '--i': i,
                  '--t': i / 41,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <label htmlFor="organization">Da informação à perspectiva</label>
        <input
          id="organization"
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          aria-describedby="experiment-caption"
        />
        <p id="experiment-caption">
          Mova o controle para revelar uma estrutura comum. Estudo visual, sem representar dados ou
          resultados financeiros.
        </p>
      </div>
      <a className="back-study" href="/estudo/">
        ← Voltar ao caderno de direção
      </a>
    </main>
  );
}
