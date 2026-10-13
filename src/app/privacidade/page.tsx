import { site } from '@/content/site';
import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('Privacidade — Mansa S.A.', '/privacidade/', false);
const configured = Boolean(site.formId);

export default function Page() {
  return (
    <main id="conteudo" className="legal-page">
      <span className="eyebrow">Mansa S.A.</span>
      <h1>
        Sua conversa.
        <br />
        <em>Seu cuidado.</em>
      </h1>
      <p className="legal-lead">Informações sobre o contato e o uso deste website institucional.</p>
      <section>
        <h2>Informações de contato</h2>
        <p>
          Pedimos nome, e-mail, interesse e mensagem para compreender sua proposta e responder. O
          nome da organização é opcional. Evite incluir documentos, dados bancários, senhas ou
          informações sensíveis na mensagem.
        </p>
        <p>
          {configured
            ? 'O formulário encaminha essas informações pelo Formspree, serviço usado para receber mensagens. A equipe da Mansa acessa a conversa para dar continuidade ao contato.'
            : 'O formulário prepara um rascunho no seu aplicativo de e-mail. Você também pode copiar a mensagem para a área de transferência do dispositivo. Se a cópia automática não estiver disponível, o texto fica acessível para cópia manual. O website não recebe nem salva os campos em um servidor ou no armazenamento local. A mensagem só é enviada quando você confirma o envio no seu aplicativo de e-mail.'}
        </p>
      </section>
      <section>
        <h2>Como usamos a conversa</h2>
        <p>
          As informações enviadas são usadas para responder a solicitações e conversar sobre
          investimento no projeto, apoio ou parcerias. Não adicionamos contatos automaticamente a
          listas de marketing.
        </p>
        <p>
          As mensagens recebidas permanecem na caixa de e-mail da equipe enquanto necessárias para
          acompanhar a conversa. Você pode solicitar acesso, correção ou exclusão pelo e-mail
          abaixo.
        </p>
      </section>
      <section>
        <h2>Preferências e navegação</h2>
        <p>
          Guardamos a escolha de tema claro, escuro ou automático no armazenamento local do seu
          navegador. Essa preferência permanece no dispositivo e pode ser apagada nas configurações
          do navegador.
        </p>
        <p>
          As fontes e os recursos visuais são servidos pelo próprio site. Esta versão não inclui
          ferramentas de análise de visitantes ou publicidade. A infraestrutura de hospedagem pode
          registrar informações técnicas de acesso, como endereço IP, horário e página solicitada.
        </p>
      </section>
      <section>
        <h2>Links externos</h2>
        <p>
          Os links para GitHub e outros websites levam a serviços com suas próprias políticas de
          privacidade. O uso do seu aplicativo e provedor de e-mail também segue as condições desses
          serviços.
        </p>
      </section>
      <section>
        <h2>Fale com a equipe</h2>
        <p>
          Para dúvidas sobre suas informações ou para exercer seus direitos, escreva para{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </section>
      <p className="legal-updated">Atualizado em 13 de outubro de 2026.</p>
    </main>
  );
}
