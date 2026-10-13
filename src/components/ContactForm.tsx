'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { m, LazyMotion, domAnimation, useReducedMotion } from 'motion/react';
import { site } from '@/content/site';
import Arrow from './Arrow';
const configured = Boolean(site.formId);
function prepareDraft(form: HTMLFormElement) {
  const data = new FormData(form);
  return {
    subject: `Mansa — ${data.get('interest')}`,
    body: `Olá, equipe Mansa.\n\nNome: ${data.get('name')}\nE-mail: ${data.get('email')}\nOrganização: ${data.get('organization') || 'Não informada'}\nInteresse: ${data.get('interest')}\n\n${data.get('message')}`,
  };
}
export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const pending = useRef<AbortController | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [manualDraft, setManualDraft] = useState('');
  const manualDraftRef = useRef<HTMLTextAreaElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    setEnhanced(true);
    const interest = new URLSearchParams(location.search).get('interesse');
    const input = formRef.current?.elements.namedItem('interest') as HTMLSelectElement | null;
    if (interest && input && [...input.options].some((option) => option.value === interest))
      input.value = interest;
    return () => pending.current?.abort();
  }, []);
  useEffect(() => {
    if (manualDraft) manualDraftRef.current?.focus();
    else if (status) statusRef.current?.focus();
  }, [status, manualDraft]);
  async function copyDraft() {
    setCopied(false);
    const form = formRef.current;
    if (!form || busy || !form.reportValidity() || new FormData(form).get('_gotcha')) return;
    const draft = prepareDraft(form);
    const text = `Para: ${site.email}\nAssunto: ${draft.subject}\n\n${draft.body}`;
    setBusy(true);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setManualDraft('');
      setStatus(
        `Mensagem copiada. Cole em um e-mail para ${site.email} e confirme o envio por lá. Seus campos foram preservados.`,
      );
    } catch {
      setManualDraft(text);
      setStatus(
        'A cópia automática não está disponível. Selecione e copie o texto abaixo para seu e-mail. Seus campos foram preservados.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (busy || !form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('_gotcha')) return;
    if (form.dataset.configured !== 'true') {
      const { subject, body } = prepareDraft(form);
      location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus(
        'A mensagem foi preparada para seu aplicativo de e-mail. Revise e confirme o envio por lá. Se o aplicativo não abrir, use “Copiar mensagem”. Seus campos continuam disponíveis.',
      );
      return;
    }
    setBusy(true);
    setStatus('');
    const controller = new AbortController();
    pending.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok || (await response.json()).ok !== true) throw new Error('unconfirmed');
      setStatus(
        'Sua mensagem foi recebida. A equipe da Mansa dará continuidade à conversa pelo e-mail informado.',
      );
      form.reset();
    } catch (error) {
      setStatus(
        error instanceof Error && error.name === 'AbortError'
          ? 'Ainda não conseguimos confirmar o recebimento. Seus campos foram preservados. Você pode tentar novamente ou escrever diretamente por e-mail.'
          : 'Não foi possível confirmar o envio. Seus campos foram preservados. Tente novamente ou escreva diretamente por e-mail.',
      );
    } finally {
      clearTimeout(timeout);
      pending.current = null;
      setBusy(false);
    }
  }
  return (
    <LazyMotion features={domAnimation}>
      <form
        ref={formRef}
        onSubmit={submit}
        aria-busy={busy || undefined}
        className="contact-form"
        onInput={() => setCopied(false)}
        id="contact-form"
        aria-describedby={!configured ? 'contact-method' : undefined}
        action={configured ? `https://formspree.io/f/${site.formId}` : `mailto:${site.email}`}
        method="post"
        encType={configured ? 'application/x-www-form-urlencoded' : 'text/plain'}
        data-contact-form
        data-configured={String(configured)}
        data-email={site.email}
      >
        <div className="form-heading">
          <span className="eyebrow">Uma conversa começa aqui</span>
          <p>Conte um pouco sobre você e o que podemos construir juntos.</p>
        </div>
        {!configured && (
          <p id="contact-method" className="contact-method">
            <strong>Você envia pelo seu e-mail.</strong>
            Este formulário prepara a mensagem no seu aplicativo de e-mail. Revise e confirme o
            envio por lá. Se preferir, copie a mensagem ou escreva para{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        )}
        <div className="field-row">
          <label>
            Seu nome <span aria-hidden="true">*</span>
            <input
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              placeholder="Como podemos chamar você?"
            />
          </label>
          <label>
            E-mail <span aria-hidden="true">*</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="voce@empresa.com"
            />
          </label>
        </div>
        <label>
          Tenho interesse em <span aria-hidden="true">*</span>
          <select name="interest" required>
            <option value="">Selecione uma opção</option>
            <option value="Investimento no projeto">Investimento no projeto</option>
            <option value="Parceria">Parceria</option>
            <option value="Apoio ao desenvolvimento">Apoio ao desenvolvimento</option>
            <option value="Outra conversa">Outra conversa</option>
          </select>
        </label>
        <label>
          Organização <span className="optional">opcional</span>
          <input
            name="organization"
            autoComplete="organization"
            maxLength={150}
            placeholder="Sua empresa ou instituição"
          />
        </label>
        <label>
          Sua mensagem <span aria-hidden="true">*</span>
          <textarea
            name="message"
            rows={4}
            required
            minLength={10}
            maxLength={5000}
            placeholder="O que aproximou você da Mansa?"
          ></textarea>
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Deixe este campo vazio
            <input name="_gotcha" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <p className="form-privacy">
          Campos com * são obrigatórios. Seus dados serão usados para responder a esta conversa.{' '}
          <a href="/privacidade/">Entenda como cuidamos das informações.</a>
        </p>
        <div className="form-actions">
          <button className="button button-dark" type="submit" disabled={busy}>
            <span data-submit-label>
              {busy
                ? configured
                  ? 'Encaminhando conversa…'
                  : 'Preparando mensagem…'
                : configured
                  ? 'Iniciar conversa'
                  : 'Preparar conversa por e-mail'}
            </span>
            <Arrow />
          </button>
          {!configured && (
            <button
              className="button button-copy"
              data-copied={copied}
              type="button"
              onClick={copyDraft}
              disabled={!enhanced || busy}
            >
              Copiar mensagem <span aria-hidden="true">{copied ? '✓' : '⤓'}</span>
            </button>
          )}
        </div>
        <m.p
          className="form-status"
          data-form-status
          role="status"
          aria-live="polite"
          tabIndex={-1}
          ref={statusRef}
          initial={false}
          animate={{ y: status ? 0 : 4 }}
          transition={{ duration: reduced ? 0 : 0.18 }}
        >
          {status}
        </m.p>
        {manualDraft && (
          <div className="manual-draft">
            <label htmlFor="manual-draft">Mensagem preparada para copiar</label>
            <textarea
              id="manual-draft"
              ref={manualDraftRef}
              value={manualDraft}
              readOnly
              rows={8}
              aria-describedby="manual-draft-help"
            />
            <p id="manual-draft-help" className="form-hint">
              Selecione o texto, copie e cole no seu e-mail. O envio é confirmado por você no
              aplicativo de e-mail.
            </p>
          </div>
        )}
        {!configured && (
          <p className="form-hint">
            Preparar ou copiar mantém seus campos preenchidos. O envio é feito por você no seu
            e-mail.
          </p>
        )}
        <noscript>
          <p className="form-hint">
            Você também pode escrever diretamente para{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a>.
          </p>
        </noscript>
      </form>
    </LazyMotion>
  );
}
