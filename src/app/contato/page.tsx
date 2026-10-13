import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';
import ContactForm from '@/components/ContactForm';

export const metadata = pageMetadata('Vamos conversar — Mansa S.A.', '/contato/', false);

export default function Page() {
  return (
    <main id="conteudo" className="contact-page">
      <header className="contact-intro">
        <span className="eyebrow">Investidores · Parceiros · Apoiadores</span>
        <h1>
          Vamos construir
          <br />
          <span>essa conversa.</span>
        </h1>
      </header>
      <div className="contact-body">
        <aside className="contact-context" aria-label="Converse com os fundadores">
          <p>
            Converse com os fundadores sobre investimento no projeto, parcerias ou apoio ao
            desenvolvimento da Mansa.
          </p>
          <a className="contact-email" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <span className="contact-signature">
            David Rangel & Heitor Rosa
            <br />
            <span>Fundadores da Mansa</span>
          </span>
        </aside>
        <ContactForm />
      </div>
    </main>
  );
}
