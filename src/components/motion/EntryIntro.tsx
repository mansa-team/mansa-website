import './entry-intro.css';

/** Hidden HTML fallback; the independent head script opts into the opening. */
export default function EntryIntro() {
  return (
    <section className="entry-intro" data-entry-intro aria-label="Introdução Mansa">
      <div className="entry-topline">
        <span>Um olhar de longo prazo.</span>
        <button type="button" data-entry-skip>
          Pular introdução <span aria-hidden="true">↗</span>
        </button>
      </div>
      <svg
        className="entry-field"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {Array.from({ length: 19 }, (_, i) => (
          <path
            key={i}
            d={`M -100 ${80 + i * 36} C 410 ${80 + i * 36}, 820 ${840 - i * 32}, 1540 ${240 + i * 23}`}
          />
        ))}
      </svg>
      <div className="entry-signature" aria-hidden="true">
        {/* Native asset also forms one of the opening's readiness milestones. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mansa-logo.png" width="80" height="80" alt="" data-entry-logo />
        <span>mansa.</span>
      </div>
      <div className="entry-bottom">
        <div className="entry-caption">
          <span>Clareza para construir.</span>
          <span>No seu tempo.</span>
        </div>
        <div
          className="entry-track"
          data-entry-progress
          suppressHydrationWarning
          role="progressbar"
          aria-label="Preparação da página"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <span />
        </div>
        <div className="entry-footnote">
          <span>Preparando a experiência</span>
          <span aria-hidden="true">M / 01</span>
        </div>
      </div>
    </section>
  );
}
