import Image from 'next/image';
import './loading-mark.css';

export default function LoadingMark({ staticMotion = false }: { staticMotion?: boolean }) {
  return (
    <div
      className="loading-mark"
      data-static-motion={staticMotion || undefined}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="loading-mark-brand" aria-hidden="true">
        <Image src="/mansa-logo.png" alt="" width={42} height={42} sizes="42px" />
        <span>mansa.</span>
      </div>
      <div className="loading-atlas" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>
        Carregando página<span aria-hidden="true">…</span>
      </p>
    </div>
  );
}
