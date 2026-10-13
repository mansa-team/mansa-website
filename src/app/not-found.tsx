import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';
import Arrow from '@/components/Arrow';

export const metadata = pageMetadata('Página não encontrada — Mansa S.A.', '/404/', true);

export default function Page() {
  return (
    <main id="conteudo" className="not-found">
      <span className="eyebrow">Página não encontrada · 404</span>
      <h1>
        Vamos encontrar
        <br />
        <em>outro caminho.</em>
      </h1>
      <p>Este endereço não está disponível. A proposta da Mansa continua na página inicial.</p>
      <a className="button button-dark" href="/">
        Voltar para a Mansa <Arrow />
      </a>
    </main>
  );
}
