'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="conteudo" className="not-found">
      <span className="eyebrow">Vamos tentar de novo</span>
      <h1>
        A conversa
        <br />
        <em>continua por aqui.</em>
      </h1>
      <p>Não conseguimos carregar esta página. Tente novamente ou volte ao início.</p>
      <div className="flex flex-wrap gap-5">
        <button className="button button-dark" onClick={reset}>
          Tentar novamente
        </button>
        <Link className="text-link" href="/">
          Voltar para a Mansa
        </Link>
      </div>
    </main>
  );
}
