import Image from 'next/image';
import Link from 'next/link';
import { site } from '@/content/site';
import Arrow from './Arrow';
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link className="brand footer-brand" href="/" aria-label="Mansa — início">
          <Image src="/mansa-logo.png" alt="" width={42} height={42} sizes="42px" />
          <span className="wordmark">
            mansa<span className="wordmark-period">.</span>
          </span>
        </Link>
        <p className="footer-statement">
          Clareza para construir.
          <br />
          Tempo para ir além.
        </p>
        <a
          className="footer-project-link"
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          Conheça o projeto no GitHub <Arrow />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Mansa S.A.</span>
        <span>Um projeto em desenvolvimento, no Brasil.</span>
        <Link href="/privacidade/">Privacidade</Link>
        <a href="#top">Voltar ao início ↑</a>
      </div>
      <p className="footer-note">
        Conteúdo institucional. Investimentos envolvem riscos. As informações deste site não
        constituem recomendação de investimento ou promessa de rentabilidade.
      </p>
    </footer>
  );
}
